(function(root){
  'use strict';
  const cfg=root.EFA_SEARCH_V3_CONFIG||{};
  let client=null;
  function required(){
    if(!cfg.supabaseUrl||!cfg.supabasePublicKey||String(cfg.supabasePublicKey).includes('REPLACE_')) throw new Error('V3 Supabase public browser configuration is missing.');
    if(!root.supabase||!root.supabase.createClient) throw new Error('Supabase browser client is not loaded.');
  }
  function redirectToLogin(){
    const next=encodeURIComponent(cfg.searchPath||'/prospecting/search-v3.html');
    location.href=(cfg.loginPath||'/portal-partner-login.html')+'?next='+next;
  }
  const Adapter={
    mode:'supabase',
    async init(){
      required();
      client=root.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublicKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
      const {data:{session},error}=await client.auth.getSession();
      if(error) throw error;
      if(!session){ redirectToLogin(); return {redirecting:true}; }
      const {data:profile,error:pe}=await client.from('partner_profiles').select('approved,role').eq('id',session.user.id).maybeSingle();
      if(pe) throw pe;
      if(!profile||profile.approved!==true) throw new Error('Your partner account is not approved for Prospect Search V3.');
      return {mode:this.mode,user_id:session.user.id};
    },
    async facets(){
      const {data,error}=await client.rpc('tc_search_facets_v3');
      if(error) throw error;
      return data||{};
    },
    async search(filters,opt){
      const payload={
        p_filters:filters||{},
        p_sort:opt?.sort||'priority_desc',
        p_limit:Math.max(1,Math.min(100,Number(opt?.limit||cfg.pageSize||50))),
        p_cursor:opt?.cursor||null
      };
      const {data,error}=await client.rpc('tc_search_v3',payload);
      if(error) throw error;
      const body=data||{};
      const rows=(body.rows||[]).map(r=>{
        const score=Number(r.priority_score);
        const coverage=Number(r.evidence_coverage);
        r.priority={
          version:r.priority_score_version||'phase1-v1.0',
          priority_score:Number.isFinite(score)?score:null,
          evidence_coverage:Number.isFinite(coverage)?coverage:0,
          measured_points:r.priority_measured_points,
          measured_max:r.priority_measured_max,
          phase1_possible_max:80,
          priority_band:!Number.isFinite(score)?'Unscored':score>=85?'Very High':score>=70?'High':score>=55?'Medium':score>=40?'Developing':'Low',
          evidence_band:coverage>=100?'Full Phase 1 evidence':coverage>=75?'Strong evidence':coverage>=50?'Partial evidence':'Limited evidence',
          components:r.priority_components||{},
          explanation:r.priority_explanation||''
        };
        return r;
      });
      return {
        rows,
        total:body.total??null,
        cursor:opt?.cursor||null,
        next_cursor:body.next_cursor||null,
        has_more:Boolean(body.next_cursor)
      };
    }
  };
  root.EFASearchV3Adapter=Adapter;
})(typeof globalThis!=='undefined'?globalThis:this);
