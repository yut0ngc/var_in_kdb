define(["backbone","QuickBase","Handlebars","vis","moment","css!./css/app.css"],function(o,a,d,i,e){"use strict";var r,s=this&&this.__extends||(r=function(e,t){return(r=Object.setPrototypeOf||({__proto__:[]}instanceof Array?function(e,t){e.__proto__=t}:function(e,t){for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o])}))(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function o(){this.constructor=e}r(e,t),e.prototype=null===t?Object.create(t):(o.prototype=t.prototype,new o)}),n=(l.getComponentDefinition=function(e){var t={id:19,componentName:"Graph",componentDescription:"Graph",appKey:"Graph",css:"graphs",ghostViewThumb:null,buildViewThumb:null,appArgs:{quickStart:[{path:"Data.Nodes.Source",message:"populate Nodes Data"},{path:"Data.Edges.Source",message:"populate Edges Data"}],websiteUrl:e.websiteUrl,json:{version:"4.4.0S2",Hidden:{NodeColumns:[],EdgeColumns:[]},Basic:{Selected:"",SelectedEdge:"",Theme:"Dark"},Data:{Nodes:{Source:"",label:"",id:"",level:"",group:"",color:{background:"",border:"",hover:{background:"",border:""},highlight:{background:"",border:""}},shape:{customShape:""}},Edges:{Source:"",from:"",to:"",id:""}},Layout:{randomSeed:1111,hierarchical:{enabled:!0,levelSeparation:150,nodeSpacing:100,direction:"LR"},clusterScale:0},Interaction:{dragNodes:!0,dragView:!0,selectConnectedEdges:!0},Physics:{enabled:!1,maxVelocity:50,minVelocity:.1,gravitationalConstant:2e3,centralGravity:.3,springLength:95,springConstant:.04},Actions:[],Tooltips:{tooltips:!1,tooltipsTemplate:""},Nodes:{borderWidth:1,borderWidthSelected:2,color:{border:"#999",background:"#97C2FC",highlight:{border:"#1795D3",background:"#FFFF7A"},hover:{border:"#2B7CE9",background:"#D2E5FF"}}},Edges:{width:1,selectionWidth:2,arrows:{to:{enabled:!0,scaleFactor:1},from:{enabled:!1,scaleFactor:1}},color:{color:"#999",highlight:"#0061FF",opacity:1}}},schema:{type:"object",title:"Properties",properties:{Hidden:{type:"object",options:{hidden:!0},properties:{NodeColumns:{type:"array",options:{hidden:!0}},EdgeColumns:{type:"array",options:{hidden:!0}}}},Basic:{type:"object",title:"Basic",options:{collapsed:!1},propertyOrder:200,properties:{Selected:{type:"viewstate",title:"Selected Node",default:""},SelectedEdge:{type:"viewstate",title:"Selected Edge",default:""},Theme:{type:"string",title:"Theme",options:{hidden:!0},enum:["Dark","Light"]},DashboardTheme:{options:{hidden:!0}}}},Data:{type:"object",options:{collapsed:!0},propertyOrder:201,properties:{Nodes:{type:"object",properties:{Source:{type:"data",title:"Source"},label:{type:"string",title:"Labels",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}},id:{type:"string",title:"id (must be unique)",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}},level:{type:"string",title:"Level (optional)",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}},group:{type:"string",title:"Group (optional)",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}},color:{title:"Color Sources",type:"object",options:{collapsed:!0},properties:{background:{type:"string",title:"Background Color",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}},border:{type:"string",title:"Border Color",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}},hover:{type:"object",title:"Hover Color",options:{collapsed:!0},properties:{background:{type:"string",title:"Background Color",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}},border:{type:"string",title:"Border Color",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}}}},highlight:{type:"object",title:"Selected Color",options:{collapsed:!0},properties:{background:{type:"string",title:"Background Color",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}},border:{type:"string",title:"Border Color",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}}}}}},shape:{title:"Shape",type:"object",options:{collapsed:!0},properties:{customShape:{type:"string",title:"Custom Shape",enumSource:"possible_node",watch:{possible_node:"root.Hidden.NodeColumns"}}}}}},Edges:{type:"object",properties:{Source:{type:"data",title:"Source"},from:{type:"string",title:"From",enumSource:"possible_edge",watch:{possible_edge:"root.Hidden.EdgeColumns"}},to:{type:"string",title:"To",enumSource:"possible_edge",watch:{possible_edge:"root.Hidden.EdgeColumns"}},id:{type:"string",title:"id (must be unique)",enumSource:"possible_edge",watch:{possible_edge:"root.Hidden.EdgeColumns"}}}}}},Interaction:{type:"object",options:{collapsed:!0},propertyOrder:202,properties:{dragNodes:{type:"boolean",title:"Draggable Nodes",default:!0,format:"checkbox"},dragView:{type:"boolean",title:"Draggable View",default:!0,format:"checkbox"},selectConnectedEdges:{type:"boolean",title:"Select Connected Edges",default:!0,format:"checkbox"}}},Physics:{type:"object",options:{collapsed:!0},propertyOrder:202,properties:{enabled:{type:"boolean",title:"Enable Physics Animations",default:!1,format:"checkbox"},maxVelocity:{type:"number",min:0,title:"Maximum Node Velocity",default:50},minVelocity:{type:"number",min:0,title:"Minimum Node Velocity",default:.1},gravitationalConstant:{type:"number",min:0,title:"Gravitational Constant",default:2e3},centralGravity:{type:"number",min:0,title:"Central Gravity Attractor",default:.3},springLength:{type:"number",min:0,title:"Length of Edges",default:95},springConstant:{type:"number",min:0,title:"Edge Stiffness",default:.04}}},Actions:{type:"actions"},Tooltips:{type:"object",options:{collapsed:!0},propertyOrder:202,properties:{tooltips:{type:"boolean",title:"Show",default:!1,format:"checkbox"},tooltipsTemplate:{type:"tooltipTemplate",title:"Template",default:""}}},Nodes:{type:"object",title:"Nodes Style",options:{collapsed:!0},propertyOrder:201,properties:{borderWidth:{type:"number",min:0,title:"Border Width",default:1},borderWidthSelected:{type:"number",title:"Selected Border Width",min:0,default:2},color:{type:"object",options:{collapsed:!0},properties:{border:{type:"gradient",options:{gradient:!1,noColor:!1},default:"#999"},background:{type:"gradient",options:{gradient:!1,noColor:!1},default:"#0061FF"},highlight:{type:"object",title:"Selected",options:{collapsed:!0},properties:{border:{type:"gradient",options:{gradient:!1,noColor:!1},default:"#1795D3"},background:{type:"gradient",options:{gradient:!1,noColor:!1},default:"#FFFF7A"}}},hover:{type:"object",title:"Hover",options:{collapsed:!0},properties:{border:{type:"gradient",options:{gradient:!1,noColor:!1},default:"#2B7CE9"},background:{type:"gradient",options:{gradient:!1,noColor:!1},default:"#D2E5FF"}}}}}}},Edges:{type:"object",title:"Edges Style",options:{collapsed:!0},propertyOrder:201,properties:{width:{type:"number",min:0,title:"Border Width",default:1},selectionWidth:{type:"number",title:"Selected Border Width",min:0,default:2},arrows:{type:"object",properties:{to:{type:"object",properties:{enabled:{type:"boolean",default:!0,format:"checkbox"},scaleFactor:{type:"number",default:1}}},from:{type:"object",properties:{enabled:{type:"boolean",default:!0,format:"checkbox"},scaleFactor:{type:"number",default:1}}}}},color:{type:"object",options:{collapsed:!0},properties:{color:{type:"gradient",options:{gradient:!1,noColor:!1},default:"#999"},highlight:{type:"gradient",options:{gradient:!1,noColor:!1},default:"#0061FF"},opacity:{type:"number",title:"Opacity",min:0,max:1}}}}},Layout:{type:"object",options:{collapsed:!0},properties:{randomSeed:{type:"number",default:1111},clusterScale:{type:"number",title:"Cluster Scale",min:0,max:100,default:0},hierarchical:{type:"object",options:{collapsed:!1},properties:{enabled:{type:"boolean",format:"checkbox",default:"true"},levelSeparation:{type:"number",default:150},nodeSpacing:{type:"number",default:100},direction:{type:"string",enum:["DU","LR","RL","UD"],default:"LR"}}}}}},_transform:function(t,o,e,i){var r,s;"Data.Nodes.Source"===e||"Data.Edges.Source"===e?(s=_.get(t,e),r=-1!==e.indexOf("Nodes")?"NodeColumns":"EdgeColumns",s?s.getMeta(function(e){t.Hidden[r]=_.concat([""],e.columns.collection.map("id")),i(t,o)}):(t.Hidden[r]=[],i(t,o))):"Physics.enabled"===e||"root"===e?(s=t.Physics.enabled,_.set(o,"properties.Physics.properties.maxVelocity.hidden",!s),_.set(o,"properties.Physics.properties.minVelocity.hidden",!s),_.set(o,"properties.Physics.properties.gravitationalConstant.hidden",!s),_.set(o,"properties.Physics.properties.centralGravity.hidden",!s),_.set(o,"properties.Physics.properties.springLength.hidden",!s),_.set(o,"properties.Physics.properties.springConstant.hidden",!s),i(t,o)):i()}}}};if(0<_.keys(e.settingsModel.attributes).length)for(var o=l.upgrades.indexOf(_.find(l.upgrades,{version:e.settingsModel.get("version")}))+1;o<l.upgrades.length;o+=1){var i=l.upgrades[o];i.fn(e.settingsModel,e),e.settingsModel.set("version",i.version)}return t},l);function l(){}n.upgrades=[{version:0,fn:function(){}},{version:"4.2.1",fn:function(e){e.set("Tooltips",{tooltips:!1,tooltipsTemplate:""}),e.set("Nodes.color.hover",{border:"#2B7CE9",background:"#D2E5FF"}),e.set("Data.Nodes.color",{background:"",border:"",hover:{background:"",border:""},highlight:{background:"",border:""}})}},{version:"4.3.0d3",fn:function(e){e.get("Actions")||e.set("Actions",[]),e.get("Data.Nodes.group")||e.set("Data.Nodes.group","")}},{version:"4.3.1",fn:function(e){e.get("Data.Nodes.shape")||e.set("Data.Nodes.shape",[])}},{version:"4.4.0S2",fn:function(e){e.set("Style",{advanced:"",cssClasses:""})}},{version:"4.6.0d",fn:function(e){e.get("Basic.SelectedEdge")||e.set("Basic.SelectedEdge",""),e.get("Data.Edges.id")||e.set("Data.Edges.id","")}},{version:"4.6.1",fn:function(e){e.set("Physics.enabled",!1),e.set("Nodes.color.background","#97C2FC")}}];h.app=d.template({compiler:[8,">= 4.3.0"],main:function(e,t,o,i,r){return'<div class="graph-container">\n    <div class="graph" >\n    </div>\n</div>'},useData:!0});var p,c=h;function h(){}function u(e){var t=p.call(this,e)||this;return t.nodesData=[],t.edgesData=[],t.nodes=[],t.edges=[],t.network=void 0,t.ignoreOnSettingsChange=!1,t.errors={},t.listenersActive=!1,t.isClustered=!1,t.groups=[],t.cachedPositions={},t.debug=!1,t.api=e.api,t.$el.html(c.app({})),t.$el.addClass("graph-app"),t.$graph=t.$el.find(".graph"),t.viewModel=new o.DeepModel({}),t}return p=o.View,s(u,p),u.prototype.onResize=function(){this.renderGraph()},u.prototype.onSettingsChange=function(e){var o=this;if(_.each(e,function(e,t){o.viewModel.set(t,e)}),!this.ignoreOnSettingsChange&&Object.keys(e).filter(function(e){return-1===u.NORENDER_KEYS.indexOf(e)&&"string"==typeof e&&-1===u.NORENDER_KEYS.indexOf(e.split(".")[0])}).length)try{this.renderGraph()}catch(e){a.Log.Warn(e.message)}else this.ignoreOnSettingsChange=!1;this.listenersActive||this.initializeListeners()},u.prototype.initializeListeners=function(){var o=this;this.listenTo(this.viewModel,"change:Data.Nodes.Source",this.onNodesSourceChange.bind(this)),this.listenTo(this.viewModel,"change:Data.Edges.Source",this.onEdgesSourceChange.bind(this)),this.listenTo(this.viewModel,"change:Data.Nodes change:Tooltips",this.parseNodes.bind(this)),this.listenTo(this.viewModel,"change:Data.Edges",this.parseEdges.bind(this)),this.listenTo(this.viewModel,"change:Basic.Selected",function(e,t){return o.onSelectedNodeChange(t)}),this.listenTo(this.viewModel,"change:Basic.SelectedEdge",function(e,t){return o.onSelectedEdgeChange(t)}),this.listenTo(this.viewModel,"change:Layout.clusterScale",this.onClusterScaleChange.bind(this)),this.onNodesSourceChange(this.viewModel,this.viewModel.get("Data.Nodes.Source")),this.onEdgesSourceChange(this.viewModel,this.viewModel.get("Data.Edges.Source")),this.listenersActive=!0},u.prototype.debugLog=function(e){(this.debug||window.hasOwnProperty("debugGraph"))&&console.log("%cGraph: "+e,"background: #222; color: #bada55")},u.prototype.debugPerf=function(e,t){var o=performance.now();t(),this.debugLog("Graph Performance: "+e+" "+(performance.now()-o).toFixed(2)+"ms")},u.prototype.destroyNetwork=function(){this.network&&this.network.destroy()},u.prototype.listenToNetwork=function(){var o=this;this.network&&(this.network.on("selectNode",function(e){o.ignoreOnSettingsChange=!0;var t=o.api.getPropertyMeta(u.PROP_SELECTED);return o.api.setProperty("Basic.Selected","list"===t.viewstateType?e.nodes:_.first(e.nodes)||""),_.defer(function(){return o.api.doActions(o.viewModel.get("Actions"),"Actions")}),!0}),this.network.on("zoom",function(e){e=e.scale;o.processCluster(e)}),this.network.once("afterDrawing",function(){o.isClustered=!1,o.network&&o.processCluster(o.network.getScale())}))},u.prototype.onClusterScaleChange=function(){this.network&&this.processCluster(this.network.getScale())},u.prototype.processCluster=function(e){var t=this.viewModel.get("Layout.clusterScale")/100;t<e&&this.isClustered?(this.unclusterNodes(),this.isClustered=!1):e<t&&!this.isClustered&&(this.clusterNodes(),this.isClustered=!0)},u.prototype.clusterNodes=function(){this.cachePositions();for(var o=this,e=0;e<this.groups.length;e++)!function(e){var t=o.groups[e];t&&o.network&&o.network.cluster({clusterNodeProperties:{font:{size:75},id:t,label:t,shape:"circle",size:50},joinCondition:function(e){return e.group===t}})}(e)},u.prototype.unclusterNodes=function(){for(var e,t=0;t<this.groups.length;t++){var o=this.groups[t];this.network&&o&&null!=(e=this.network)&&e.isCluster(o)&&this.network.openCluster(o)}this.restoreCachedPositions()},u.prototype.cachePositions=function(){this.network&&(this.cachedPositions=this.network.getPositions())},u.prototype.restoreCachedPositions=function(){for(var e=Object.keys(this.cachedPositions),t=0;t<e.length;t++){var o=this.cachedPositions[e[t]],i=o.x,o=o.y;this.network&&this.network.moveNode(e[t],i,o)}},u.prototype.mapDataAttributes=function(){var t=this;return{edges:new i.DataSet(_.map(this.edges,function(e){return e=e,_.extend({},{arrows:{to:!0},labelHighlightBold:!1,selectionWidth:function(e){return e},shadow:!1,width:1},t.viewModel.get("Edges"),e)})),nodes:new i.DataSet(_.map(this.nodes,function(e){return e=e,_.merge({},{font:{face:"FontAwesome,Arial",size:12},labelHighlightBold:!1,shape:"box",shapeProperties:{borderRadius:3}},t.viewModel.get("Nodes"),e)}))}},u.prototype.onEdgesData=function(e,t,o){if(this.debugLog("onEdgesData Triggered"),o)return this.updateError("Edge Source",o);this.edgesData=t.items(),this.parseEdges()},u.prototype.onEdgesSourceChange=function(e,o){this.edgesSource&&(this.stopListening(this.edgesSource),this.api.unsubscribe(this.edgesSource),this.edgesSource=void 0),this.edgesSource=o,this.edgesSource&&this.edgesSource.attributes?(this.updateError("Edge Source",void 0),this.api.subscribe(this.edgesSource,this.onEdgesData.bind(this))):this.updateError("Edge Source",{error:t('Invalid Data Source: "')+o.path+'" '+t("selected"),type:"Warning"})},u.prototype.onNodesData=function(e,t,o){if(this.debugLog("onNodesdata Triggered"),o)return this.updateError("Nodes Source",o);this.nodesData=t.items(),this.parseNodes()},u.prototype.onNodesSourceChange=function(e,o){this.nodesSource&&(this.stopListening(this.nodesSource),this.api.unsubscribe(this.nodesSource),this.nodesSource=void 0),this.nodesSource=o,this.nodesSource&&this.nodesSource.attributes?(this.updateError("Node Source",void 0),this.api.subscribe(this.nodesSource,this.onNodesData.bind(this))):this.updateError("Node Source",{error:t('Invalid Data Source: "')+o.path+'" '+t("selected"),type:"Warning"})},u.prototype.isValueInNetwork=function(t){var o=this;return!_.isNil(t)&&void 0!==_.find(this.nodesData,function(e){return e[o.viewModel.get("Data.Nodes.id")].toString()===t.toString()})},u.prototype.onSelectedNodeChange=function(e){if(this.network){if(!_.isNil(e)){e=Array.isArray(e)?_.first(e):e;if(!_.isNil(e)&&this.isValueInNetwork(e))return void this.network.setSelection({edges:[],nodes:[e]})}this.network.setSelection({edges:[],nodes:[]})}},u.prototype.onSelectedEdgeChange=function(e){var o=this;if(this.network){if(this.network.on("selectEdge",function(e){var t=o.api.getPropertyMeta(u.PROP_SELECTED_EDGE);return o.api.setProperty("Basic.SelectedEdge","list"===t.viewstateType?e.edges:_.first(e.edges)||""),!0}),!_.isNil(e)){e=Array.isArray(e)?_.first(e):e;if(!_.isNil(e)&&""!==e)return void this.network.setSelection({edges:[e],nodes:[]})}this.network.setSelection({edges:[],nodes:[]})}},u.prototype.parseEdges=function(){var e,o,i,r;this.edgesData.length&&(e=this.viewModel.get("Data.Edges"),o=e.to,i=e.from,r=e.id,o&&i?this.edges=_.map(this.edgesData,function(e){var t=_.clone(e);return t.to=e[o],t.from=e[i],t.id=e[r],t}):(this.edges=[],a.Log.Warn("To & From are required fields.")),this.setData())},u.prototype.parseNodes=function(){var o,i,r,e,t,s,n=this;this.nodesData.length&&(t=this.viewModel.get("Data.Nodes"),o=t.label,i=t.id,r=t.group,e=(t=this.viewModel.get("Tooltips")).tooltips,t=t.tooltipsTemplate,s=e?d.compile(t):void 0,o&&i?this.nodes=_.map(this.nodesData,function(e){var t=_.clone(e);return t.id=e[i],t.color=n.generateColorFromNode(e),t.shape=n.generateShapeFromNode(e),t.title=s?s(e):void 0,t.label=""+e[o],t.group=e[r],t}):(this.nodes=[],a.Log.Warn("Label & id are required fields.")),this.setData(),this.setGroups())},u.prototype.generateShapeFromNode=function(e){return e[this.viewModel.get("Data.Nodes.shape.customShape")]},u.prototype.setData=function(){var e=this;try{this.network&&this.nodes.length&&this.edges.length&&this.debugPerf("Set Data",function(){e.network&&e.network.setData(e.mapDataAttributes()),e.onSelectedNodeChange(e.viewModel.get("Basic.Selected")),e.onSelectedEdgeChange(e.viewModel.get("Basic.SelectedEdge"))})}catch(e){a.Log.Warn(e.message)}},u.prototype.setGroups=function(){this.groups=_.uniq(this.nodes.map(function(e){return e.group}))},u.prototype.generateColorFromNode=function(e){var t=this.viewModel.get("Data.Nodes.color");return{background:e[t.background],border:e[t.border],highlight:{background:e[t.highlight.background],border:e[t.highlight.border]},hover:{background:e[t.hover.background],border:e[t.hover.border]}}},u.prototype.renderGraph=function(){var e=this,t=(this.destroyNetwork(),{interaction:_.extend({hover:!0,multiselect:!0},this.viewModel.get("Interaction")),layout:_.extend({hierarchical:{blockShifting:!0,edgeMinimization:!0,parentCentralization:!0,sortMethod:"directed"},improvedLayout:!0},_.omit(this.viewModel.get("Layout"),"clusterScale")),physics:{enabled:this.viewModel.get("Physics.enabled"),barnesHut:{gravitationalConstant:-Math.abs(this.viewModel.get("Physics.gravitationalConstant"))||0,centralGravity:this.viewModel.get("Physics.centralGravity")||0,springLength:this.viewModel.get("Physics.springLength")||0,springConstant:this.viewModel.get("Physics.springConstant")||0},maxVelocity:this.viewModel.get("Physics.maxVelocity")||0,minVelocity:this.viewModel.get("Physics.minVelocity")||0,solver:"barnesHut"}});this.debugPerf("Render Graph",function(){e.network=new i.Network(e.$graph[0],e.mapDataAttributes(),t)}),this.setData(),this.listenToNetwork()},u.prototype.updateError=function(e,t){t?this.errors[e]=t:delete this.errors[e],_.keys(this.errors).length?(t=_.map(this.errors,function(e,t){return"["+t+"]: "+e.error}),this.api.showErrorMessage({error:t.join("\n"),type:"Warning"})):this.api.hideErrorMessage()},u.getComponentDefinition=n.getComponentDefinition,u.PROP_SELECTED="Basic.Selected",u.PROP_SELECTED_EDGE="Basic.SelectedEdge",u.NORENDER_KEYS=["Basic.Selected","Basic.SelectedEdge","Data","Tooltips","Layout.clusterScale"],u});