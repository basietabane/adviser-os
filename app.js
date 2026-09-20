// ============================================================
// ADVISER OS — APPLICATION ENGINE
// Version 5.0
// Live Intelligence + Prospecting Radar + News + Opportunities
// ============================================================

console.log("Adviser OS v5 loading...");

let supabaseClient = null;

try {

  if (
    window.supabase &&
    window.SUPABASE_URL &&
    window.SUPABASE_PUBLISHABLE_KEY
  ) {

    supabaseClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_PUBLISHABLE_KEY
    );

    console.log("Adviser OS: Supabase connected.");

  } else {

    console.warn(
      "Adviser OS: Supabase configuration not found."
    );

  }

} catch(error){

  console.error(
    "Adviser OS: Supabase connection failed.",
    error
  );

}


// ============================================================
// STATE
// ============================================================

const AdviserOS = {

  connected:false,

  adviser:{
    id:"",
    name:"",
    email:"",
    phone:"",
    target:13,
    sales:0
  },

  prospects:[],
  products:[],
  productIntersections:[],
  ideas:[],
  news:[],
  prospectingSignals:[],
  territorySignals:[],
  activities:[],
  appointments:[],
  opportunities:[]
};


// ============================================================
// HELPERS
// ============================================================

function escapeHtml(value){

  if(value===null || value===undefined){
    return "";
  }

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


function safeText(value,fallback="Not available"){

  if(
    value===null ||
    value===undefined ||
    String(value).trim()===""
  ){
    return fallback;
  }

  return String(value);
}


function formatDate(value){

  if(!value){
    return "Date unavailable";
  }

  const date=new Date(value);

  if(Number.isNaN(date.getTime())){
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-ZA",
    {
      day:"numeric",
      month:"short",
      year:"numeric"
    }
  );
}


function confidenceInfo(value){

  const v=String(value||"").toLowerCase();

  if(v==="high"){

    return {
      className:"high",
      background:"#e8f7f2",
      color:"#087c68",
      label:"HIGH CONFIDENCE"
    };

  }

  if(v==="medium" || v==="moderate"){

    return {
      className:"medium",
      background:"#fff7df",
      color:"#8b681e",
      label:"MODERATE CONFIDENCE"
    };

  }

  return {
    className:"early",
    background:"#edf3ff",
    color:"#316bd6",
    label:"EARLY SIGNAL"
  };
}


// ============================================================
// CONNECTION
// ============================================================

function updateConnectionDisplay(){

  const elements=document.querySelectorAll(
    ".connection-status,#connection-status,[data-connection-status]"
  );

  elements.forEach(element=>{

    element.textContent=
      AdviserOS.connected
        ? "● Supabase Connected"
        : "● Prototype Online";

  });

}


async function checkSupabaseConnection(){

  if(!supabaseClient){

    AdviserOS.connected=false;
    updateConnectionDisplay();
    return false;

  }

  try{

    const {error}=await supabaseClient
      .from("news")
      .select("id")
      .limit(1);

    if(error){

      console.error(
        "Adviser OS: Supabase test failed:",
        error.message
      );

      AdviserOS.connected=false;
      updateConnectionDisplay();

      return false;
    }

    AdviserOS.connected=true;
    updateConnectionDisplay();

    return true;

  }catch(error){

    AdviserOS.connected=false;
    updateConnectionDisplay();

    console.error(
      "Adviser OS: connection test failed.",
      error
    );

    return false;
  }

}


// ============================================================
// DATA LOADERS
// ============================================================

async function loadAdviser(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("advisers")
      .select("*")
      .limit(1);

    if(error){
      console.warn("Adviser loading failed:",error.message);
      return;
    }

    if(data && data.length){

      const adviser=data[0];

      AdviserOS.adviser.id=adviser.id||"";
      AdviserOS.adviser.name=adviser.full_name||"";
      AdviserOS.adviser.email=adviser.email||"";
      AdviserOS.adviser.phone=adviser.phone||"";
      AdviserOS.adviser.target=
        Number(adviser.target_sales)||13;

    }

  }catch(error){

    console.error("Adviser loading failed.",error);

  }

}


async function loadProspects(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("prospects")
      .select("*");

    if(error){

      console.warn(
        "Prospect loading failed:",
        error.message
      );

      AdviserOS.prospects=[];
      return;
    }

    AdviserOS.prospects=data||[];

  }catch(error){

    AdviserOS.prospects=[];

  }

}


async function loadProducts(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("products")
      .select("*")
      .eq("active",true)
      .order("name");

    if(error){

      console.warn(
        "Product loading failed:",
        error.message
      );

      AdviserOS.products=[];
      return;
    }

    AdviserOS.products=data||[];

  }catch(error){

    AdviserOS.products=[];

  }

}


async function loadProductIntersections(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("product_intersections")
      .select("*")
      .eq("active",true);

    if(error){

      console.warn(
        "Product intersections failed:",
        error.message
      );

      AdviserOS.productIntersections=[];
      return;
    }

    AdviserOS.productIntersections=(data||[]).map(item=>{

      const a=AdviserOS.products.find(
        product=>product.id===item.product_a_id
      );

      const b=AdviserOS.products.find(
        product=>product.id===item.product_b_id
      );

      return {
        ...item,
        productAName:a ? a.name : "Unknown Product",
        productBName:b ? b.name : "Unknown Product"
      };

    });

  }catch(error){

    AdviserOS.productIntersections=[];

  }

}


async function loadActivities(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("activities")
      .select("*");

    if(error){

      AdviserOS.activities=[];
      return;
    }

    AdviserOS.activities=data||[];

  }catch(error){

    AdviserOS.activities=[];

  }

}


async function loadAppointments(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("appointments")
      .select("*");

    if(error){

      AdviserOS.appointments=[];
      return;
    }

    AdviserOS.appointments=data||[];

  }catch(error){

    AdviserOS.appointments=[];

  }

}


async function loadSales(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("sales")
      .select("*");

    if(error){

      console.warn(
        "Sales loading failed:",
        error.message
      );

      return;
    }

    AdviserOS.adviser.sales=(data||[]).length;

  }catch(error){

    console.warn(
      "Sales loading failed.",
      error
    );

  }

}


async function loadNews(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("news")
      .select(`
        id,
        headline,
        source,
        url,
        category,
        summary,
        why_it_matters,
        published_at,
        created_at,
        relevance,
        product_connection,
        active
      `)
      .eq("active",true)
      .order(
        "published_at",
        {
          ascending:false,
          nullsFirst:false
        }
      )
      .limit(20);

    if(error){

      console.warn(
        "News loading failed:",
        error.message
      );

      AdviserOS.news=[];
      return;
    }

    AdviserOS.news=data||[];

  }catch(error){

    AdviserOS.news=[];

  }

}


async function loadProspectingSignals(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("prospecting_signals")
      .select(`
        id,
        title,
        signal_type,
        location,
        segment,
        source,
        source_url,
        detected_at,
        event_date,
        estimated_start_date,
        estimated_financial_window,
        summary,
        evidence,
        inference,
        potential_needs,
        product_connection,
        action,
        confidence,
        status,
        active,
        next_review_at
      `)
      .eq("active",true)
      .order("detected_at",{ascending:false});

    if(error){

      console.warn(
        "Prospecting signal loading failed:",
        error.message
      );

      AdviserOS.prospectingSignals=[];
      return;
    }

    AdviserOS.prospectingSignals=data||[];

  }catch(error){

    AdviserOS.prospectingSignals=[];

  }

}


async function loadTerritorySignals(){

  if(!supabaseClient)return;

  try{

    const {data,error}=await supabaseClient
      .from("territory_signals")
      .select(`
        id,
        territory,
        industry,
        signal_type,
        title,
        summary,
        evidence,
        inference,
        affected_segment,
        potential_needs,
        product_connection,
        timing,
        confidence,
        source,
        source_url,
        detected_at,
        active,
        next_review_at
      `)
      .eq("active",true)
      .order("detected_at",{ascending:false});

    if(error){

      console.warn(
        "Territory signal loading failed:",
        error.message
      );

      AdviserOS.territorySignals=[];
      return;
    }

    AdviserOS.territorySignals=data||[];

  }catch(error){

    AdviserOS.territorySignals=[];

  }

}


// ============================================================
// COMMAND CENTRE
// ============================================================

function updateCommandCentre(){

  const target=document.querySelector("[data-cycle-target]");
  const sales=document.querySelector("[data-sales]");
  const prospects=document.querySelector("[data-active-prospects]");
  const hot=document.querySelector("[data-hot-leads]");

  if(target){
    target.textContent=AdviserOS.adviser.target;
  }

  if(sales){
    sales.textContent=AdviserOS.adviser.sales;
  }

  if(prospects){
    prospects.textContent=AdviserOS.prospects.length;
  }

  if(hot){

    const count=AdviserOS.prospects.filter(p=>{

      const priority=String(p.priority||"").toLowerCase();
      const status=String(p.status||"").toLowerCase();

      return (
        p.hot===true ||
        p.hot==="true" ||
        priority==="hot" ||
        priority==="high" ||
        status==="hot"
      );

    }).length;

    hot.textContent=count;
  }

}


// ============================================================
// PRODUCT INTELLIGENCE
// ============================================================

function getProductByName(name){

  if(!name)return null;

  return AdviserOS.products.find(
    product=>
      String(product.name||"").toLowerCase()===
      String(name).toLowerCase()
  )||null;

}


function getProductIntersections(productName){

  if(!productName)return [];

  return AdviserOS.productIntersections.filter(item=>{

    return (
      item.productAName===productName ||
      item.productBName===productName
    );

  });

}


// ============================================================
// OPPORTUNITY ENGINE
// ============================================================

function analyseProspectOpportunity(prospect){

  if(!prospect)return null;

  const productInterest=
    String(prospect.product_interest||"").trim();

  const primaryProduct=
    productInterest
      ? AdviserOS.products.find(
          p=>
            String(p.name||"").toLowerCase()===
            productInterest.toLowerCase()
        )
      : null;

  const opportunities=[];

  if(primaryProduct){

    getProductIntersections(
      primaryProduct.name
    ).forEach(intersection=>{

      const complementary=
        intersection.productAName===
        primaryProduct.name
          ? intersection.productBName
          : intersection.productAName;

      const product=
        getProductByName(complementary);

      if(product){

        opportunities.push({

          product:product.name,

          category:product.category,

          relationship:
            intersection.relationship_type,

          explanation:
            intersection.explanation

        });

      }

    });

  }

  return {

    prospectId:prospect.id||"",

    prospectName:
      prospect.full_name||
      "Unnamed Prospect",

    organisation:
      prospect.organisation||"",

    segment:
      prospect.segment||"",

    location:
      prospect.location||"",

    stage:
      prospect.stage||"",

    priority:
      prospect.priority||"",

    productInterest,

    estimatedPremium:
      Number(prospect.estimated_premium)||0,

    notes:
      prospect.notes||"",

    nextAction:
      prospect.next_action||"",

    followUpDate:
      prospect.follow_up_date||"",

    primaryProduct:
      primaryProduct
        ? primaryProduct.name
        : productInterest,

    opportunities

  };

}


function runOpportunityEngine(){

  if(!AdviserOS.prospects.length){

    AdviserOS.opportunities=[];
    return [];

  }

  AdviserOS.opportunities=
    AdviserOS.prospects
      .map(analyseProspectOpportunity)
      .filter(
        result=>
          result &&
          result.opportunities &&
          result.opportunities.length
      );

  return AdviserOS.opportunities;

}


function getOpportunitySummary(){

  const opportunities=
    runOpportunityEngine();

  return {

    prospects:opportunities.length,

    opportunities:
      opportunities.reduce(
        (total,item)=>
          total+item.opportunities.length,
        0
      ),

    highPriority:
      opportunities.filter(item=>{

        const p=
          String(item.priority||"").toLowerCase();

        return p==="high"||p==="hot";

      }).length

  };

}


function getProspectOpportunities(prospectId){

  const prospect=
    AdviserOS.prospects.find(
      item=>item.id===prospectId
    );

  return prospect
    ? analyseProspectOpportunity(prospect)
    : null;

}


function generateNextMove(opportunity){

  if(!opportunity){
    return "Begin with a needs-based discovery conversation.";
  }

  if(opportunity.nextAction){
    return opportunity.nextAction;
  }

  const stage=
    String(opportunity.stage||"").toLowerCase();

  if(stage.includes("new")||stage.includes("lead")){

    return "Start with discovery questions before discussing products.";

  }

  if(stage.includes("quote")||stage.includes("proposal")){

    return "Follow up on the proposal and address outstanding questions.";

  }

  if(stage.includes("follow")){

    return "Follow up and establish whether another legitimate planning need exists.";

  }

  return "Explore the primary need first, then consider a complementary opportunity.";

}


// ============================================================
// NEWS
// ============================================================

function getNewsRelevanceClass(relevance){

  const value=
    String(relevance||"").toLowerCase();

  if(
    value.includes("high")||
    value.includes("critical")||
    value.includes("strong")
  ){
    return "high";
  }

  if(
    value.includes("medium")||
    value.includes("moderate")
  ){
    return "medium";
  }

  return "normal";

}


function createNewsIntelligence(){

  let centre=
    document.getElementById(
      "adviser-os-news-intelligence"
    );

  if(!centre){

    centre=document.createElement("section");
    centre.id="adviser-os-news-intelligence";

    const first=document.querySelector(".main");

    if(first){
      first.insertBefore(centre,first.firstChild);
    }

  }

  centre.innerHTML="";

  const panel=document.createElement("div");

  panel.style.cssText=`
    background:#fff;
    border:1px solid #dfe7eb;
    border-radius:17px;
    padding:22px;
    box-shadow:0 7px 24px rgba(8,25,35,.065);
    margin-bottom:20px;
  `;

  const heading=document.createElement("div");

  heading.innerHTML=`

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:15px;
      flex-wrap:wrap;
      margin-bottom:18px;
    ">

      <div>

        <div style="
          font-size:10px;
          font-weight:800;
          letter-spacing:1px;
          color:#d0a64b;
          text-transform:uppercase;
        ">
          Market Intelligence
        </div>

        <h2 style="
          margin:4px 0 0;
          color:#15232d;
          font-size:24px;
        ">
          Current Industry News
        </h2>

        <div style="
          margin-top:5px;
          color:#6c7b86;
          font-size:13px;
        ">
          Developments connected to financial services,
          clients, products and adviser conversations.
        </div>

      </div>

      <div style="
        padding:8px 12px;
        border-radius:20px;
        background:#edf7f4;
        color:#087c68;
        font-size:11px;
        font-weight:800;
      ">
        ${AdviserOS.news.length} STORIES
      </div>

    </div>

  `;

  panel.appendChild(heading);

  if(!AdviserOS.news.length){

    const empty=document.createElement("div");

    empty.style.cssText=`
      padding:28px;
      border:1px dashed #cbd5df;
      border-radius:13px;
      text-align:center;
      color:#6c7b86;
      background:#fafcfd;
    `;

    empty.innerHTML=`

      <strong style="
        display:block;
        color:#344550;
        font-size:17px;
        margin-bottom:6px;
      ">
        News Intelligence is ready
      </strong>

      Add industry stories to the
      <strong>news</strong> table and they will appear here.

    `;

    panel.appendChild(empty);

  }else{

    const grid=document.createElement("div");

    grid.style.cssText=`
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(280px,1fr));
      gap:16px;
    `;

    AdviserOS.news.forEach(article=>{

      const card=document.createElement("article");

      card.style.cssText=`
        border:1px solid #dfe7eb;
        border-radius:15px;
        padding:17px;
        background:#fff;
        transition:.22s ease;
      `;

      card.onmouseenter=()=>{
        card.style.transform="translateY(-3px)";
        card.style.boxShadow="0 12px 30px rgba(8,25,35,.11)";
      };

      card.onmouseleave=()=>{
        card.style.transform="";
        card.style.boxShadow="";
      };

      const relevance=
        article.relevance||
        "Industry relevance";

      const relevanceClass=
        getNewsRelevanceClass(relevance);

      const colour=
        relevanceClass==="high"
          ? ["#e8f7f2","#087c68"]
          : relevanceClass==="medium"
            ? ["#fff7df","#8b681e"]
            : ["#f4f7fb","#667085"];

      card.innerHTML=`

        <div style="
          display:flex;
          justify-content:space-between;
          gap:8px;
          margin-bottom:11px;
        ">

          <span style="
            padding:5px 8px;
            border-radius:7px;
            background:#f4f7fb;
            color:#344550;
            font-size:9px;
            font-weight:800;
            text-transform:uppercase;
          ">
            ${escapeHtml(article.category||"Industry")}
          </span>

          <span style="
            padding:5px 8px;
            border-radius:7px;
            background:${colour[0]};
            color:${colour[1]};
            font-size:9px;
            font-weight:800;
          ">
            ${escapeHtml(relevance)}
          </span>

        </div>

        <h3 style="
          margin:0;
          font-size:17px;
          line-height:1.4;
          color:#15232d;
        ">
          ${escapeHtml(
            article.headline||"Untitled story"
          )}
        </h3>

        <div style="
          margin-top:7px;
          font-size:11px;
          color:#6c7b86;
        ">
          ${escapeHtml(article.source||"Industry source")}
          ·
          ${escapeHtml(
            formatDate(
              article.published_at||
              article.created_at
            )
          )}
        </div>

        ${
          article.summary
            ? `
              <p style="
                margin:12px 0 0;
                font-size:13px;
                line-height:1.55;
                color:#475760;
              ">
                ${escapeHtml(article.summary)}
              </p>
            `
            :""
        }

        ${
          article.why_it_matters
            ? `
              <div style="
                margin-top:13px;
                padding:11px;
                border-left:3px solid #d0a64b;
                border-radius:9px;
                background:#fffaf0;
              ">
                <div style="
                  font-size:9px;
                  font-weight:800;
                  color:#8b681e;
                  text-transform:uppercase;
                  letter-spacing:.5px;
                ">
                  Why it matters
                </div>

                <div style="
                  margin-top:4px;
                  font-size:12px;
                  line-height:1.5;
                  color:#684f18;
                ">
                  ${escapeHtml(article.why_it_matters)}
                </div>
              </div>
            `
            :""
        }

        ${
          article.product_connection
            ? `
              <div style="
                margin-top:10px;
                padding:10px;
                border-radius:9px;
                background:#edf7f4;
              ">
                <div style="
                  font-size:9px;
                  font-weight:800;
                  color:#087c68;
                  text-transform:uppercase;
                ">
                  Product connection
                </div>

                <div style="
                  margin-top:4px;
                  font-size:12px;
                  line-height:1.5;
                  color:#245c51;
                ">
                  ${escapeHtml(article.product_connection)}
                </div>
              </div>
            `
            :""
        }

        ${
          article.url
            ? `
              <a
                href="${escapeHtml(article.url)}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  display:inline-block;
                  margin-top:13px;
                  color:#087c68;
                  font-size:12px;
                  font-weight:800;
                  text-decoration:none;
                "
              >
                Read source →
              </a>
            `
            :""
        }

      `;

      grid.appendChild(card);

    });

    panel.appendChild(grid);

  }

  centre.appendChild(panel);

}


// ============================================================
// OPPORTUNITY CENTRE
// ============================================================

function createOpportunityCentre(){

  let centre=
    document.getElementById(
      "adviser-os-opportunity-centre"
    );

  if(!centre){

    centre=document.createElement("section");
    centre.id="adviser-os-opportunity-centre";

    const main=document.querySelector(".main");

    if(main){
      main.insertBefore(
        centre,
        main.children[1]||null
      );
    }

  }

  const opportunities=runOpportunityEngine();
  const summary=getOpportunitySummary();

  centre.innerHTML="";

  const panel=document.createElement("div");

  panel.style.cssText=`
    background:#fff;
    border:1px solid #dfe7eb;
    border-radius:17px;
    padding:22px;
    box-shadow:0 7px 24px rgba(8,25,35,.065);
    margin-bottom:20px;
  `;

  panel.innerHTML=`

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:15px;
      flex-wrap:wrap;
      margin-bottom:18px;
    ">

      <div>

        <div style="
          font-size:10px;
          font-weight:800;
          letter-spacing:1px;
          color:#d0a64b;
          text-transform:uppercase;
        ">
          Adviser Intelligence
        </div>

        <h2 style="
          margin:4px 0 0;
          color:#15232d;
          font-size:24px;
        ">
          Opportunity Centre
        </h2>

        <div style="
          margin-top:5px;
          color:#6c7b86;
          font-size:13px;
        ">
          Connect actual prospect needs with relevant product intelligence.
        </div>

      </div>

      <button
        id="opportunity-refresh"
        class="button"
      >
        Refresh
      </button>

    </div>

  `;

  panel.querySelector("#opportunity-refresh").onclick=
    async function(){

      this.textContent="Refreshing...";

      await refreshAdviserOSData();

      createOpportunityCentre();
      createNewsIntelligence();
      createProspectingRadar();

    };


  const summaryGrid=document.createElement("div");

  summaryGrid.style.cssText=`
    display:grid;
    grid-template-columns:
      repeat(auto-fit,minmax(150px,1fr));
    gap:12px;
    margin-bottom:20px;
  `;

  [
    ["Prospects with Opportunities",summary.prospects],
    ["Product Connections",summary.opportunities],
    ["High Priority",summary.highPriority],
    ["Products Loaded",AdviserOS.products.length]
  ].forEach(item=>{

    const box=document.createElement("div");

    box.style.cssText=`
      padding:15px;
      background:#f7fafb;
      border:1px solid #e2e9ed;
      border-radius:12px;
    `;

    box.innerHTML=`

      <div style="
        font-size:10px;
        color:#6c7b86;
        text-transform:uppercase;
        letter-spacing:.5px;
      ">
        ${escapeHtml(item[0])}
      </div>

      <div style="
        margin-top:5px;
        font-size:26px;
        font-weight:850;
        color:#15232d;
      ">
        ${item[1]}
      </div>

    `;

    summaryGrid.appendChild(box);

  });

  panel.appendChild(summaryGrid);


  if(!opportunities.length){

    const empty=document.createElement("div");

    empty.style.cssText=`
      padding:25px;
      text-align:center;
      border:1px dashed #cbd5df;
      border-radius:12px;
      color:#6c7b86;
      background:#fafcfd;
    `;

    empty.innerHTML=`

      <strong style="
        display:block;
        color:#344550;
        font-size:17px;
        margin-bottom:6px;
      ">
        Opportunity Engine is ready
      </strong>

      Add product interests to prospects and
      Adviser OS will identify configured
      complementary product relationships.

    `;

    panel.appendChild(empty);

  }else{

    const grid=document.createElement("div");

    grid.style.cssText=`
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(290px,1fr));
      gap:15px;
    `;

    opportunities.forEach(opportunity=>{

      const card=document.createElement("div");

      card.style.cssText=`
        border:1px solid #dfe7eb;
        border-radius:14px;
        padding:17px;
        background:#fff;
        transition:.22s ease;
      `;

      card.onmouseenter=()=>{
        card.style.transform="translateY(-2px)";
        card.style.boxShadow="0 12px 28px rgba(8,25,35,.1)";
      };

      card.onmouseleave=()=>{
        card.style.transform="";
        card.style.boxShadow="";
      };

      const priority=
        String(opportunity.priority||"").toLowerCase();

      const high=
        priority==="high"||
        priority==="hot";

      let connections="";

      opportunity.opportunities.forEach(item=>{

        connections+=`

          <div style="
            margin-top:10px;
            padding:12px;
            border-radius:10px;
            background:#edf7f4;
          ">

            <div style="
              font-size:9px;
              color:#087c68;
              font-weight:800;
              text-transform:uppercase;
            ">
              Complementary opportunity
            </div>

            <div style="
              margin-top:4px;
              font-size:16px;
              font-weight:800;
              color:#15232d;
            ">
              ${escapeHtml(item.product)}
            </div>

            <div style="
              margin-top:4px;
              font-size:12px;
              line-height:1.5;
              color:#475760;
            ">
              ${escapeHtml(
                item.explanation||
                "Configured product relationship."
              )}
            </div>

          </div>

        `;

      });

      card.innerHTML=`

        <div style="
          display:flex;
          justify-content:space-between;
          gap:10px;
        ">

          <div>

            <div style="
              font-size:17px;
              font-weight:800;
              color:#15232d;
            ">
              ${escapeHtml(opportunity.prospectName)}
            </div>

            <div style="
              margin-top:3px;
              font-size:11px;
              color:#6c7b86;
            ">
              ${escapeHtml(
                opportunity.organisation||
                opportunity.segment||
                "Prospect"
              )}
            </div>

          </div>

          ${
            high
              ? `
                <span style="
                  padding:5px 8px;
                  background:#fff2e3;
                  color:#9a6200;
                  border-radius:7px;
                  font-size:9px;
                  font-weight:800;
                ">
                  HIGH PRIORITY
                </span>
              `
              :""
          }

        </div>

        <div style="
          margin-top:13px;
          padding:11px;
          border-radius:10px;
          background:#f5f8fa;
        ">

          <div style="
            font-size:9px;
            color:#6c7b86;
            text-transform:uppercase;
            font-weight:800;
          ">
            Current product interest
          </div>

          <div style="
            margin-top:4px;
            font-size:15px;
            font-weight:800;
            color:#15232d;
          ">
            ${escapeHtml(
              opportunity.primaryProduct||
              opportunity.productInterest||
              "Not specified"
            )}
          </div>

        </div>

        ${connections}

        <div style="
          margin-top:13px;
          padding-top:12px;
          border-top:1px solid #e6ecef;
        ">

          <div style="
            font-size:9px;
            color:#6c7b86;
            font-weight:800;
            text-transform:uppercase;
          ">
            Suggested next move
          </div>

          <div style="
            margin-top:5px;
            font-size:12px;
            line-height:1.5;
            color:#344550;
          ">
            ${escapeHtml(
              generateNextMove(opportunity)
            )}
          </div>

        </div>

      `;

      grid.appendChild(card);

    });

    panel.appendChild(grid);

  }

  centre.appendChild(panel);

}


// ============================================================
// RADAR DETAIL
// ============================================================

function showRadarIntelligence(signalId){

  const signal=
    AdviserOS.prospectingSignals.find(
      item=>item.id===signalId
    );

  if(!signal)return;

  let modal=
    document.getElementById(
      "adviser-os-radar-detail"
    );

  if(!modal){

    modal=document.createElement("div");

    modal.id="adviser-os-radar-detail";

    modal.style.cssText=`
      position:fixed;
      inset:0;
      z-index:9999;
      background:rgba(5,18,25,.68);
      backdrop-filter:blur(5px);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
    `;

    modal.onclick=function(event){

      if(event.target===modal){
        closeRadarIntelligence();
      }

    };

    document.body.appendChild(modal);

  }

  const confidence=confidenceInfo(signal.confidence);

  const box=(title,text,bg,color)=>`

    <div style="
      padding:15px;
      border-radius:12px;
      background:${bg};
    ">

      <div style="
        font-size:9px;
        font-weight:850;
        color:${color};
        letter-spacing:.6px;
        text-transform:uppercase;
        margin-bottom:6px;
      ">
        ${escapeHtml(title)}
      </div>

      <div style="
        font-size:13px;
        line-height:1.55;
        color:#344550;
      ">
        ${escapeHtml(
          safeText(text)
        )}
      </div>

    </div>

  `;

  modal.innerHTML=`

    <div style="
      width:min(900px,100%);
      max-height:92vh;
      overflow:auto;
      background:#fff;
      border-radius:20px;
      box-shadow:0 25px 80px rgba(0,0,0,.3);
    ">

      <div style="
        padding:23px;
        color:#fff;
        background:
          radial-gradient(circle at 85% 15%,rgba(208,166,75,.2),transparent 25%),
          linear-gradient(135deg,#081923,#0d2a38);
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          gap:15px;
        ">

          <div>

            <div style="
              font-size:9px;
              font-weight:850;
              letter-spacing:1px;
              color:#d0a64b;
              text-transform:uppercase;
            ">
              Prospecting Intelligence
            </div>

            <h2 style="
              margin:6px 0 0;
              font-size:24px;
              line-height:1.3;
            ">
              ${escapeHtml(
                signal.title||
                "Untitled signal"
              )}
            </h2>

            <div style="
              margin-top:7px;
              color:#aebfc5;
              font-size:12px;
            ">
              ${escapeHtml(
                signal.location||
                "Location unavailable"
              )}
              ·
              ${escapeHtml(
                signal.signal_type||
                "Signal"
              )}
            </div>

          </div>

          <button
            onclick="closeRadarIntelligence()"
            style="
              width:36px;
              height:36px;
              border:1px solid rgba(255,255,255,.12);
              border-radius:10px;
              background:rgba(255,255,255,.07);
              color:#fff;
              cursor:pointer;
              font-size:18px;
            "
          >
            ×
          </button>

        </div>

        <div style="
          display:inline-flex;
          margin-top:15px;
          padding:6px 9px;
          border-radius:8px;
          background:${confidence.background};
          color:${confidence.color};
          font-size:9px;
          font-weight:850;
        ">
          ${confidence.label}
        </div>

      </div>

      <div style="padding:22px;">

        <div style="
          display:grid;
          grid-template-columns:
            repeat(auto-fit,minmax(250px,1fr));
          gap:13px;
        ">

          ${box(
            "Documented evidence",
            signal.evidence||
            signal.summary,
            "#edf7f4",
            "#087c68"
          )}

          ${box(
            "AI interpretation",
            signal.inference,
            "#edf3ff",
            "#316bd6"
          )}

          ${box(
            "Financial timing",
            signal.estimated_financial_window,
            "#fff7df",
            "#8b681e"
          )}

          ${box(
            "Affected segment",
            signal.segment,
            "#f6f8fa",
            "#667780"
          )}

          ${box(
            "Potential needs",
            signal.potential_needs,
            "#f6f8fa",
            "#667780"
          )}

          ${box(
            "Product connection",
            signal.product_connection,
            "#edf7f4",
            "#087c68"
          )}

        </div>

        <div style="
          margin-top:15px;
          padding:17px;
          border-radius:13px;
          color:#fff;
          background:linear-gradient(135deg,#0b7c68,#056452);
        ">

          <div style="
            font-size:9px;
            font-weight:850;
            letter-spacing:.6px;
            text-transform:uppercase;
            opacity:.75;
          ">
            Suggested action
          </div>

          <div style="
            margin-top:6px;
            font-size:14px;
            line-height:1.55;
          ">
            ${escapeHtml(
              safeText(
                signal.action,
                "Monitor the signal and establish actual client need before recommending a product."
              )
            )}
          </div>

        </div>

        <div style="
          display:flex;
          justify-content:space-between;
          flex-wrap:wrap;
          gap:10px;
          margin-top:16px;
          padding-top:14px;
          border-top:1px solid #e6ecef;
          font-size:11px;
          color:#6c7b86;
        ">

          <span>
            Source:
            <strong>
              ${escapeHtml(
                signal.source||
                "Not specified"
              )}
            </strong>
          </span>

          <span>
            Detected:
            ${escapeHtml(
              formatDate(signal.detected_at)
            )}
          </span>

          ${
            signal.source_url
              ? `
                <a
                  href="${escapeHtml(signal.source_url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    color:#087c68;
                    font-weight:800;
                    text-decoration:none;
                  "
                >
                  Open source →
                </a>
              `
              :""
          }

        </div>

      </div>

    </div>

  `;

  modal.style.display="flex";

}


function closeRadarIntelligence(){

  const modal=
    document.getElementById(
      "adviser-os-radar-detail"
    );

  if(modal){
    modal.remove();
  }

}


// ============================================================
// LIVE PROSPECTING RADAR
// ============================================================

function createProspectingRadar(){

  const radar=document.getElementById("radar");

  if(!radar)return;

  let panel=
    document.getElementById(
      "adviser-os-live-radar"
    );

  if(!panel){

    panel=document.createElement("div");
    panel.id="adviser-os-live-radar";
    radar.appendChild(panel);

  }

  panel.innerHTML="";

  const signals=
    AdviserOS.prospectingSignals||[];

  const territory=
    AdviserOS.territorySignals||[];

  const localSignals=
    signals.filter(signal=>{

      const location=
        String(signal.location||"").toLowerCase();

      return (
        location.includes("mmabatho")||
        location.includes("mahikeng")
      );

    });


  // HEADER

  const header=document.createElement("div");

  header.className="radar-header";

  header.innerHTML=`

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:flex-start;
      gap:15px;
      flex-wrap:wrap;
    ">

      <div>

        <div style="
          color:#d0a64b;
          font-size:10px;
          font-weight:850;
          letter-spacing:1px;
          text-transform:uppercase;
        ">
          LIVE INTELLIGENCE LAYER
        </div>

        <h2>Prospecting Radar</h2>

        <p>
          Signals are translated into location,
          segment, timing, potential need,
          product connection and a professional next action.
        </p>

      </div>

      <button
        id="radar-refresh-button"
        style="
          border:1px solid rgba(255,255,255,.13);
          border-radius:10px;
          padding:10px 14px;
          background:rgba(255,255,255,.08);
          color:#fff;
          font-weight:800;
          cursor:pointer;
        "
      >
        Refresh Radar
      </button>

    </div>

    <div style="
      display:flex;
      flex-wrap:wrap;
      gap:7px;
      margin-top:20px;
    ">

      ${
        [
          "SIGNAL",
          "LOCATION",
          "SEGMENT",
          "TIMING",
          "NEED",
          "PRODUCT",
          "ACTION"
        ].map((x,i)=>`
          <span style="
            padding:7px 10px;
            border-radius:20px;
            background:${i===0
              ?"rgba(208,166,75,.2)"
              :"rgba(255,255,255,.08)"};
            border:1px solid rgba(255,255,255,.1);
            font-size:9px;
            font-weight:800;
            color:#eef4f5;
          ">
            ${x}
          </span>
        `).join("")
      }

    </div>

  `;

  panel.appendChild(header);


  const refreshButton=
    header.querySelector("#radar-refresh-button");

  if(refreshButton){

    refreshButton.onclick=async function(){

      this.textContent="Refreshing...";

      await refreshAdviserOSData();

      createProspectingRadar();

    };

  }


  // SUMMARY

  const summary=document.createElement("div");

  summary.style.cssText=`
    display:grid;
    grid-template-columns:
      repeat(auto-fit,minmax(150px,1fr));
    gap:12px;
    margin-bottom:21px;
  `;

  const summaryItems=[

    [
      "Live signals",
      signals.length,
      "#087c68",
      "Active intelligence signals"
    ],

    [
      "Local signals",
      localSignals.length,
      "#d0a64b",
      "Mahikeng / Mmabatho"
    ],

    [
      "Territory signals",
      territory.length,
      "#316bd6",
      "Wider North West picture"
    ],

    [
      "High confidence",
      signals.filter(
        s=>
          String(s.confidence||"").toLowerCase()==="high"
      ).length,
      "#7357b8",
      "Strong supporting evidence"
    ]

  ];

  summaryItems.forEach(item=>{

    const card=document.createElement("div");

    card.className="card";

    card.style.cssText=`
      padding:17px;
      position:relative;
      overflow:hidden;
    `;

    card.innerHTML=`

      <div style="
        font-size:10px;
        color:#6c7b86;
        font-weight:750;
        text-transform:uppercase;
        letter-spacing:.5px;
      ">
        ${item[0]}
      </div>

      <div style="
        margin-top:4px;
        font-size:29px;
        line-height:1;
        font-weight:850;
        color:${item[2]};
      ">
        ${item[1]}
      </div>

      <div style="
        margin-top:6px;
        font-size:11px;
        color:#7a8992;
      ">
        ${item[3]}
      </div>

    `;

    summary.appendChild(card);

  });

  panel.appendChild(summary);


  // TODAY'S SIGNALS

  const title=document.createElement("div");

  title.innerHTML=`

    <div style="
      display:flex;
      align-items:flex-end;
      justify-content:space-between;
      gap:10px;
      margin-bottom:12px;
    ">

      <div>

        <h3 style="
          margin:0;
          font-size:20px;
          color:#15232d;
        ">
          Today's Signals
        </h3>

        <div style="
          margin-top:4px;
          color:#6c7b86;
          font-size:12px;
        ">
          Current signals from the intelligence layer.
        </div>

      </div>

      <div style="
        font-size:11px;
        color:#6c7b86;
      ">
        ${signals.length} active
      </div>

    </div>

  `;

  panel.appendChild(title);


  if(!signals.length){

    const empty=document.createElement("div");

    empty.style.cssText=`
      padding:30px;
      background:#fff;
      border:1px dashed #cbd5df;
      border-radius:14px;
      text-align:center;
      color:#6c7b86;
    `;

    empty.innerHTML=`
      <strong style="
        display:block;
        color:#344550;
        font-size:17px;
        margin-bottom:5px;
      ">
        No active signals
      </strong>
      The Radar is connected and ready for new intelligence.
    `;

    panel.appendChild(empty);

  }else{

    const grid=document.createElement("div");

    grid.style.cssText=`
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(310px,1fr));
      gap:16px;
    `;

    signals.forEach(signal=>{

      const confidence=
        confidenceInfo(signal.confidence);

      const card=document.createElement("article");

      card.className="signal-card";

      card.innerHTML=`

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:9px;
        ">

          <span style="
            padding:5px 8px;
            border-radius:7px;
            background:#f4f7fb;
            color:#344550;
            font-size:9px;
            font-weight:850;
            text-transform:uppercase;
          ">
            ${escapeHtml(
              signal.signal_type||
              "Signal"
            )}
          </span>

          <span class="confidence ${confidence.className}"
            style="
              padding:5px 8px;
              border-radius:7px;
              font-size:9px;
              font-weight:850;
            ">
            ${confidence.label}
          </span>

        </div>

        <h3>
          ${escapeHtml(
            signal.title||
            "Untitled signal"
          )}
        </h3>

        <div class="signal-location">
          <strong>Location:</strong>
          ${escapeHtml(
            signal.location||
            "Not specified"
          )}
        </div>

        <div style="
          margin-top:13px;
          padding:12px;
          border-radius:10px;
          background:#f6f9fa;
        ">

          <div style="
            font-size:9px;
            font-weight:850;
            color:#6c7b86;
            text-transform:uppercase;
            letter-spacing:.5px;
          ">
            Signal summary
          </div>

          <div style="
            margin-top:5px;
            font-size:12px;
            line-height:1.55;
            color:#344550;
          ">
            ${escapeHtml(
              signal.summary||
              signal.evidence||
              "No summary available."
            )}
          </div>

        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:9px;
          margin-top:10px;
        ">

          <div style="
            padding:10px;
            border-radius:9px;
            background:#edf3ff;
          ">

            <div style="
              font-size:8px;
              font-weight:850;
              color:#316bd6;
              text-transform:uppercase;
            ">
              Segment
            </div>

            <div style="
              margin-top:4px;
              font-size:11px;
              line-height:1.45;
              color:#344550;
            ">
              ${escapeHtml(
                signal.segment||
                "Not specified"
              )}
            </div>

          </div>

          <div style="
            padding:10px;
            border-radius:9px;
            background:#fff7df;
          ">

            <div style="
              font-size:8px;
              font-weight:850;
              color:#8b681e;
              text-transform:uppercase;
            ">
              Timing
            </div>

            <div style="
              margin-top:4px;
              font-size:11px;
              line-height:1.45;
              color:#684f18;
            ">
              ${escapeHtml(
                signal.estimated_financial_window||
                "Developing"
              )}
            </div>

          </div>

        </div>

        <div style="
          margin-top:10px;
          padding:11px;
          border-radius:9px;
          background:#edf7f4;
        ">

          <div style="
            font-size:8px;
            font-weight:850;
            color:#087c68;
            text-transform:uppercase;
          ">
            Potential needs
          </div>

          <div style="
            margin-top:4px;
            font-size:11px;
            line-height:1.5;
            color:#245c51;
          ">
            ${escapeHtml(
              signal.potential_needs||
              "Needs assessment required."
            )}
          </div>

        </div>

        <div style="
          margin-top:10px;
          padding:11px;
          border-radius:9px;
          background:#f7f9fb;
        ">

          <div style="
            font-size:8px;
            font-weight:850;
            color:#6c7b86;
            text-transform:uppercase;
          ">
            Product connection
          </div>

          <div style="
            margin-top:4px;
            font-size:11px;
            line-height:1.5;
            color:#344550;
          ">
            ${escapeHtml(
              signal.product_connection||
              "Needs-based product matching."
            )}
          </div>

        </div>

        <div style="
          margin-top:10px;
          padding:11px;
          border-radius:9px;
          background:#09202b;
          color:#fff;
        ">

          <div style="
            font-size:8px;
            font-weight:850;
            color:#d0a64b;
            text-transform:uppercase;
          ">
            Suggested action
          </div>

          <div style="
            margin-top:4px;
            font-size:11px;
            line-height:1.5;
            color:#d8e3e6;
          ">
            ${escapeHtml(
              signal.action||
              "Establish actual client need before recommending a product."
            )}
          </div>

        </div>

        <button
          data-radar-signal-id="${escapeHtml(signal.id)}"
          style="
            width:100%;
            margin-top:13px;
            padding:11px;
            border:0;
            border-radius:10px;
            background:linear-gradient(135deg,#087c68,#056452);
            color:#fff;
            font-weight:800;
            cursor:pointer;
            transition:.2s ease;
          "
        >
          Open Full Intelligence →
        </button>

        <div style="
          margin-top:8px;
          font-size:9px;
          color:#8a969e;
        ">
          Detected ${escapeHtml(
            formatDate(signal.detected_at)
          )}
        </div>

      `;

      const button=
        card.querySelector(
          "[data-radar-signal-id]"
        );

      if(button){

        button.onclick=()=>{
          showRadarIntelligence(signal.id);
        };

        button.onmouseenter=()=>{
          button.style.transform="translateY(-1px)";
          button.style.boxShadow="0 7px 15px rgba(8,124,104,.2)";
        };

        button.onmouseleave=()=>{
          button.style.transform="";
          button.style.boxShadow="";
        };

      }

      grid.appendChild(card);

    });

    panel.appendChild(grid);

  }


  // TERRITORY PULSE

  const territorySection=document.createElement("div");

  territorySection.style.marginTop="28px";

  territorySection.innerHTML=`

    <h3 style="
      margin:0;
      color:#15232d;
      font-size:20px;
    ">
      Territory Pulse
    </h3>

    <div style="
      margin-top:4px;
      margin-bottom:12px;
      color:#6c7b86;
      font-size:12px;
    ">
      Wider territory-level signals that may affect prospecting conditions.
    </div>

  `;

  panel.appendChild(territorySection);


  if(!territory.length){

    const empty=document.createElement("div");

    empty.style.cssText=`
      padding:20px;
      background:#fff;
      border:1px dashed #cbd5df;
      border-radius:13px;
      color:#6c7b86;
    `;

    empty.textContent=
      "No active territory signals available.";

    panel.appendChild(empty);

  }else{

    const grid=document.createElement("div");

    grid.style.cssText=`
      display:grid;
      grid-template-columns:
        repeat(auto-fit,minmax(300px,1fr));
      gap:15px;
    `;

    territory.forEach(signal=>{

      const confidence=
        confidenceInfo(signal.confidence);

      const card=document.createElement("article");

      card.className="signal-card";

      card.innerHTML=`

        <div style="
          display:flex;
          justify-content:space-between;
          gap:10px;
        ">

          <div style="
            font-size:9px;
            font-weight:850;
            color:#6c7b86;
            letter-spacing:.6px;
            text-transform:uppercase;
          ">
            ${escapeHtml(
              signal.industry||
              "Territory"
            )}
          </div>

          <span class="confidence ${confidence.className}"
            style="
              padding:5px 8px;
              border-radius:7px;
              font-size:9px;
              font-weight:850;
            ">
            ${confidence.label}
          </span>

        </div>

        <h3>
          ${escapeHtml(
            signal.title||
            "Territory signal"
          )}
        </h3>

        <div class="signal-location">
          <strong>Territory:</strong>
          ${escapeHtml(
            signal.territory||
            "Not specified"
          )}
        </div>

        <div style="
          margin-top:12px;
          font-size:12px;
          line-height:1.55;
          color:#475760;
        ">
          ${escapeHtml(
            signal.summary||
            "No summary available."
          )}
        </div>

        ${
          signal.evidence
            ? `
              <div style="
                margin-top:11px;
                padding:10px;
                background:#edf7f4;
                border-radius:9px;
              ">
                <strong style="
                  display:block;
                  font-size:8px;
                  color:#087c68;
                  text-transform:uppercase;
                ">
                  Evidence
                </strong>

                <div style="
                  margin-top:4px;
                  font-size:11px;
                  line-height:1.5;
                  color:#344550;
                ">
                  ${escapeHtml(signal.evidence)}
                </div>
              </div>
            `
            :""
        }

        ${
          signal.inference
            ? `
              <div style="
                margin-top:8px;
                padding:10px;
                background:#edf3ff;
                border-radius:9px;
              ">
                <strong style="
                  display:block;
                  font-size:8px;
                  color:#316bd6;
                  text-transform:uppercase;
                ">
                  AI interpretation
                </strong>

                <div style="
                  margin-top:4px;
                  font-size:11px;
                  line-height:1.5;
                  color:#344550;
                ">
                  ${escapeHtml(signal.inference)}
                </div>
              </div>
            `
            :""
        }

        <div style="
          margin-top:9px;
          padding:10px;
          background:#fff7df;
          border-radius:9px;
        ">

          <strong style="
            display:block;
            font-size:8px;
            color:#8b681e;
            text-transform:uppercase;
          ">
            Timing
          </strong>

          <div style="
            margin-top:4px;
            font-size:11px;
            line-height:1.45;
            color:#684f18;
          ">
            ${escapeHtml(
              signal.timing||
              "Developing"
            )}
          </div>

        </div>

        ${
          signal.affected_segment
            ? `
              <div style="
                margin-top:9px;
                font-size:11px;
                color:#475760;
              ">
                <strong>Affected segment:</strong>
                ${escapeHtml(signal.affected_segment)}
              </div>
            `
            :""
        }

        ${
          signal.potential_needs
            ? `
              <div style="
                margin-top:6px;
                font-size:11px;
                color:#475760;
              ">
                <strong>Potential needs:</strong>
                ${escapeHtml(signal.potential_needs)}
              </div>
            `
            :""
        }

        ${
          signal.product_connection
            ? `
              <div style="
                margin-top:9px;
                padding:10px;
                background:#edf7f4;
                border-radius:9px;
              ">
                <strong style="
                  display:block;
                  font-size:8px;
                  color:#087c68;
                  text-transform:uppercase;
                ">
                  Product connection
                </strong>

                <div style="
                  margin-top:4px;
                  font-size:11px;
                  line-height:1.5;
                  color:#245c51;
                ">
                  ${escapeHtml(signal.product_connection)}
                </div>
              </div>
            `
            :""
        }

      `;

      grid.appendChild(card);

    });

    panel.appendChild(grid);

  }


  // LOCAL CLUSTER

  if(localSignals.length>=2){

    const cluster=document.createElement("div");

    cluster.style.cssText=`
      margin-top:18px;
      padding:18px;
      border-radius:14px;
      background:
        linear-gradient(135deg,#fffaf0,#fff);
      border:1px solid #efdca9;
      box-shadow:0 5px 18px rgba(139,104,30,.05);
    `;

    cluster.innerHTML=`

      <div style="
        font-size:9px;
        font-weight:850;
        color:#8b681e;
        letter-spacing:.7px;
        text-transform:uppercase;
      ">
        Local Cluster Detected
      </div>

      <div style="
        margin-top:5px;
        font-size:18px;
        font-weight:850;
        color:#684f18;
      ">
        Mmabatho / Mahikeng
      </div>

      <div style="
        margin-top:5px;
        font-size:12px;
        line-height:1.55;
        color:#684f18;
      ">
        ${localSignals.length} active local signal(s)
        currently connect to this territory.
        This is territory-level intelligence and does
        not identify individuals or confirm future appointments.
      </div>

    `;

    panel.appendChild(cluster);

  }


  // TIMING ENGINE

  const timing=document.createElement("div");

  timing.style.cssText=`
    margin-top:18px;
    padding:18px;
    border-radius:14px;
    background:#f7fafb;
    border:1px solid #dfe7eb;
  `;

  timing.innerHTML=`

    <div style="
      font-size:9px;
      font-weight:850;
      color:#6c7b86;
      letter-spacing:.7px;
      text-transform:uppercase;
    ">
      Timing Engine
    </div>

    <div style="
      display:flex;
      flex-wrap:wrap;
      gap:7px;
      margin-top:10px;
    ">

      ${
        [
          "1. Detected",
          "2. Developing",
          "3. Event",
          "4. Financial transition",
          "5. Follow-up",
          "6. Monitor"
        ].map((x,i)=>`

          <span style="
            padding:7px 10px;
            border-radius:8px;
            background:#fff;
            border:1px solid #dfe7eb;
            font-size:10px;
            font-weight:750;
            color:${i===3?"#087c68":"#475760"};
          ">
            ${x}
          </span>

        `).join("")
      }

    </div>

    <div style="
      margin-top:11px;
      color:#6c7b86;
      font-size:11px;
      line-height:1.5;
    ">
      Timing is a planning model. It does not establish
      that a particular person has been appointed, paid,
      or is ready to purchase a financial product.
    </div>

  `;

  panel.appendChild(timing);


  // DEFINITIONS

  const definitions=document.createElement("div");

  definitions.style.cssText=`
    margin-top:18px;
    padding:15px;
    border-top:1px solid #e6ecef;
    color:#6c7b86;
    font-size:11px;
    line-height:1.6;
  `;

  definitions.innerHTML=`

    <strong style="color:#344550;">
      Radar confidence:
    </strong>

    High = recent signal supported by strong evidence.
    Moderate = useful signal with some uncertainty.
    Early = interesting signal requiring further evidence.

    <br><br>

    Radar intelligence should be combined with actual
    client discovery and verified information before
    making any recommendation.

  `;

  panel.appendChild(definitions);

}


// ============================================================
// REFRESH
// ============================================================

async function refreshAdviserOSData(){

  console.log("Adviser OS: refreshing...");

  await loadAdviser();
  await loadProspects();
  await loadProducts();
  await loadProductIntersections();
  await loadActivities();
  await loadAppointments();
  await loadSales();
  await loadNews();
  await loadProspectingSignals();
  await loadTerritorySignals();

  runOpportunityEngine();
  updateCommandCentre();
  updateConnectionDisplay();

  console.log("Adviser OS: refresh complete.");

}


// ============================================================
// NAVIGATION
// ============================================================

function navigateTo(screenId){

  const screen=document.getElementById(screenId);

  if(!screen){
    console.warn(
      "Adviser OS: Screen not found:",
      screenId
    );
    return;
  }

  document
    .querySelectorAll(".screen")
    .forEach(item=>{
      item.classList.remove("active");
    });

  screen.classList.add("active");

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


function newProspect(){
  navigateTo("prospects");
}


function clientDiscovery(){
  navigateTo("clients");
}


function productIntelligence(){
  navigateTo("products");
}


// ============================================================
// INITIALISE
// ============================================================

async function initialiseAdviserOS(){

  console.log("Adviser OS initialising...");

  updateCommandCentre();
  updateConnectionDisplay();

  const connected=
    await checkSupabaseConnection();

  if(connected){

    await refreshAdviserOSData();

  }

  updateCommandCentre();
  updateConnectionDisplay();

  setTimeout(()=>{

    createNewsIntelligence();
    createOpportunityCentre();
    createProspectingRadar();

  },500);

  console.log(
    "Adviser OS initialisation complete."
  );

}


// ============================================================
// AUTOMATIC REFRESH
// ============================================================

setInterval(async()=>{

  if(!AdviserOS.connected){
    return;
  }

  await refreshAdviserOSData();

  createNewsIntelligence();
  createOpportunityCentre();
  createProspectingRadar();

},60000);


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  ()=>{
    initialiseAdviserOS();
  }
);


// ============================================================
// GLOBALS
// ============================================================

window.AdviserOS=AdviserOS;

window.navigateTo=navigateTo;
window.newProspect=newProspect;
window.clientDiscovery=clientDiscovery;
window.productIntelligence=productIntelligence;

window.refreshAdviserOSData=
  refreshAdviserOSData;

window.getProductByName=
  getProductByName;

window.getProductIntersections=
  getProductIntersections;

window.analyseProspectOpportunity=
  analyseProspectOpportunity;

window.runOpportunityEngine=
  runOpportunityEngine;

window.getProspectOpportunities=
  getProspectOpportunities;

window.getOpportunitySummary=
  getOpportunitySummary;

window.createOpportunityCentre=
  createOpportunityCentre;

window.loadNews=
  loadNews;

window.createNewsIntelligence=
  createNewsIntelligence;

window.loadProspectingSignals=
  loadProspectingSignals;

window.loadTerritorySignals=
  loadTerritorySignals;

window.createProspectingRadar=
  createProspectingRadar;

window.showRadarIntelligence=
  showRadarIntelligence;

window.closeRadarIntelligence=
  closeRadarIntelligence;


console.log(
  "Adviser OS v5 app.js loaded successfully."
);


// ============================================================
// FINAL CONNECTION CHECK
// ============================================================

setTimeout(()=>{

  const status=
    document.getElementById(
      "connection-status"
    );

  if(status){

    status.textContent=
      AdviserOS.connected
        ? "● Supabase Connected"
        : "● Supabase NOT Connected";

  }

},3000);
