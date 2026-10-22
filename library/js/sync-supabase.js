/* Shared storage for the website copy: wording sets and client files live in Edwards Financial's
   own database, so an edit made on one computer shows up on every other one.

   It presents the same small interface the app's storage layer expects
   (doc(path).set/delete, collection(path).onSnapshot), so nothing else has to change.

   Scopes:
     'house'  wording, read by every signed-in partner, changed only by an account marked admin
     <uuid>   client files, private to the partner who made them
*/
window.EFA = window.EFA || {};
(function () {
  const TABLE = 'library_docs';
  const parentOf = (p) => p.slice(0, p.lastIndexOf('/'));
  const idOf = (p) => p.slice(p.lastIndexOf('/') + 1);
  const scopeOf = (path, uid) => (path.indexOf('wording') === 0 ? 'house' : uid);

  function make(sb, uid, isAdmin) {
    const subs = [];        // {parent, scope, cb}
    const cache = {};       // parent -> {id: data}
    let channel = null;

    function snapshot(parent) {
      const m = cache[parent] || {};
      const docs = Object.keys(m).map((id) => ({ id, data: () => m[id] }));
      return { docs, empty: docs.length === 0, size: docs.length, metadata: { hasPendingWrites: false } };
    }
    function fire(parent) {
      subs.filter((s) => s.parent === parent).forEach((s) => { try { s.cb(snapshot(parent)); } catch (e) { console.warn('library sync listener failed', e); } });
    }
    async function pull(parent, scope) {
      const { data, error } = await sb.from(TABLE).select('doc_id,data').eq('scope', scope).eq('parent', parent);
      if (error) throw error;
      const m = {};
      (data || []).forEach((r) => { m[r.doc_id] = r.data || {}; });
      cache[parent] = m;
      fire(parent);
    }
    function listen() {
      if (channel || !sb.channel) return;
      channel = sb.channel('library-docs')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, (payload) => {
          const row = payload.new && payload.new.path ? payload.new : payload.old;
          if (!row) return;
          const parent = row.parent || parentOf(row.path || '');
          if (!subs.some((s) => s.parent === parent)) return;
          const m = cache[parent] || (cache[parent] = {});
          if (payload.eventType === 'DELETE') delete m[row.doc_id || idOf(row.path)];
          else m[payload.new.doc_id || idOf(payload.new.path)] = payload.new.data || {};
          fire(parent);
        })
        .subscribe();
    }

    return {
      kind: 'supabase', isAdmin,
      doc(path) {
        const scope = scopeOf(path, uid);
        return {
          async set(value) {
            const { error } = await sb.from(TABLE).upsert({
              scope, path, data: value, updated_by: uid, updated_at: new Date().toISOString()
            }, { onConflict: 'scope,path' });
            if (error) { const e = new Error(error.message); e.code = /row-level security|permission/i.test(error.message) ? 'invalid_argument' : error.code; throw e; }
            const parent = parentOf(path);
            if (cache[parent]) { cache[parent][idOf(path)] = value; fire(parent); }
            return true;
          },
          async delete() {
            const { error } = await sb.from(TABLE).delete().eq('scope', scope).eq('path', path);
            if (error) { const e = new Error(error.message); e.code = /row-level security|permission/i.test(error.message) ? 'invalid_argument' : error.code; throw e; }
            const parent = parentOf(path);
            if (cache[parent]) { delete cache[parent][idOf(path)]; fire(parent); }
            return true;
          }
        };
      },
      collection(parent) {
        const scope = scopeOf(parent + '/x', uid);
        return {
          onSnapshot(cb, onError) {
            const sub = { parent, scope, cb };
            subs.push(sub);
            listen();
            pull(parent, scope).catch((e) => { if (onError) onError(e); else console.warn('library sync read failed', e); });
            return () => { const i = subs.indexOf(sub); if (i >= 0) subs.splice(i, 1); };
          }
        };
      }
    };
  }

  /** Resolve the shared store, or null when this copy has no signed-in partner behind it. */
  EFA.supabaseSync = function supabaseSync(cfg) {
    const g = window.supabase;
    if (!g || !cfg || !cfg.url || !cfg.key) return Promise.resolve(null);
    let sb;
    try { sb = window.EFA_SB || (window.EFA_SB = g.createClient(cfg.url, cfg.key)); } catch (e) { return Promise.resolve(null); }
    return sb.auth.getSession().then(async (r) => {
      const session = r && r.data && r.data.session;
      if (!session || !session.user) return null;
      let isAdmin = false;
      try {
        const { data } = await sb.from('library_admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
        isAdmin = !!data;
      } catch (e) { isAdmin = false; }
      return make(sb, session.user.id, isAdmin);
    }).catch(() => null);
  };
})();
