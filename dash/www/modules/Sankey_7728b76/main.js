define(["backbone","echarts","Handlebars","QuickBase","css!./css/app.css"],function(n,e,t,o){"use strict";var i,r=this&&this.__extends||(i=function(t,e){return(i=Object.setPrototypeOf||({__proto__:[]}instanceof Array?function(t,e){t.__proto__=e}:function(t,e){for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n])}))(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function n(){this.constructor=t}i(t,e),t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)}),s=(a.getComponentDefinition=function(){return{id:1134,componentName:"Sankey",componentDescription:"Sankey Chart",appKey:"Sankey",css:"Sankey",appArgs:{json:{version:"4.5.0",_PossibleColumns:[""],Basics:{Data:"",Focus:"",AggregateColumn:""}},schema:{type:"object",title:"Properties",_transform:function(e,t,n,o){"Basics.Data"===n?e.Basics.Data?e.Basics.Data.getMeta(function(t){e._PossibleColumns=_.difference(t.columns.collection.map("id"),t.breakdownColumns),o(e)}):(e._PossibleColumns=[],o(e)):o()},properties:{Basics:{type:"object",title:"Basics",propertyOrder:1,properties:{Data:{title:"Data Source",type:"data",default:""},Focus:{type:"viewstate",title:"Focus",default:""},AggregateColumn:{title:"Aggregate Column",type:"customDropdown",default:"",data:"possible_columns",watch:{possible_columns:"root._PossibleColumns"}}}},Style:{type:"object",title:"Style",options:{collapsed:!0},propertyOrder:210,properties:{advanced:{type:"css",title:"Advanced CSS",default:""}}},_PossibleColumns:{type:"readOnlyArray",items:{type:"string"},default:[],options:{hidden:!0}}}}}}},a);function a(){}c.app=t.template({compiler:[8,">= 4.3.0"],main:function(t,e,n,o,i){return'<div class="sankey-container">\n    <div class="chart-area"></div>\n   \n    \x3c!-- Only used to store current last tooltip html --\x3e\n</div>'},useData:!0});var u=c;function c(){}l.focus2Array=function(t){var e,n=[],o=/"([^"]*)"/g,t=t.toString?t.toString():"",i=/^\[([^\]]*)]$/.exec(t);if(null!=i){if(/^(?:"[^"\\]*(?:\\[\S\s][^"\\]*)*")(?:,"[^"\\]*(?:\\[\S\s][^"\\]*)*")*/.test(i[1]))for(;null!==(e=o.exec(i[1]));)n.push(_.map(e[1].split(","),function(t){return t}))}else n.push(t.split(","));return _.filter(n,function(t){return 0<(""+t).length})},l.hasCalc=function(){var t="width:",e=document.createElement("div");return e.style.cssText=t+["","-webkit-","-moz-","-o-","-ms-"].join("calc(10px);"+t),!!e.style.length},l.sumArrayValues=function(t){return t.reduce(function(t,e){return t+e},0)},l.getConditionResult=function(t,e,n){var o,i,r=!1;switch(l.OPERATORS_FOR_CONVERTION[n]&&(o=(""+t).toLowerCase(),i=(""+e).toLowerCase()),n){case"contains":r=0<=o.indexOf(i);break;case"starts with":r=0===o.indexOf(i);break;case"ends with":r=-1!==o.indexOf(i,o.length-i.length);break;case"==":r=t==e;break;case"<":r=t<e;break;case">":r=e<t;break;case"<=":r=t<=e;break;case">=":r=e<=t;break;case"!=":r=t!=e;break;default:console.log("GRID: highlight rule with unknown operator: ",n)}return r},l.OPERATORS_FOR_CONVERTION=_.reduce(["contains","starts with","ends with","search"],function(t,e){return t[e]=!0,t},{});var h=l;function l(){}f.mergeChanges=function(e,n,t,o,i,r){return t&&(e=_.fromPairs(_.map(t,function(t){return[n(t),t]}))),o&&_.each(o,function(t){return _.extend(e[n(t)],t)}),i&&_.each(i,function(t){e[n(t)]=t}),r&&_.each(r,function(t){delete e[n(t)]}),e},f.prototype.setFocus=function(e){this.focus=e,this.updateChildren(),_.each(this.children,function(t){return t.setFocus(e)})},f.prototype.isFocused=function(){return this.focus.length===this.depth&&(0===this.depth||this.source.id===this.focus[this.depth])},f.prototype.getColumnNames=function(){if(this.breakdownColumns&&this.breakdownColumns.length)return[f.BREAKDOWN_ID,this.breakdownColumns[0]].concat(_.difference(_.keys(this.meta),this.breakdownColumns));try{return _.map(this.meta,function(t){return[t.id,t.index]}).sort(function(t,e){return t[1]-e[1]}).map(function(t){return t[0]})}catch(t){return _.keys(this.meta)}},f.prototype.getData=function(e){var n=this;this.source.dataSet&&e.add(this.source.dataSet.collection.map(function(t){return t.depth=n.depth,t})),_.each(this.children,function(t){return t.getData(e)})},f.prototype.getDepth=function(){return this.children[0]?this.children[0].getDepth():this.depth},f.prototype.getKey=function(){return this.source.cid},f.prototype.getPrimaryKey=function(){return this.children[0]?this.children[0].getPrimaryKey():this.primaryKey},f.prototype.getPropertyFromColumn=function(t){return t===f.BREAKDOWN_ID?this.getPrimaryKey():t},f.prototype.getPath=function(){return this.source.path},f.prototype.getSource=function(){return this.source},f.prototype.hasData=function(){return this.children.length?_.some(this.children,function(t){return t.hasData()}):this.hasDataFlag},f.prototype.onData=function(t,e,n){t.primaryKey!==this.primaryKey&&(this.primaryKey=t.primaryKey);var o=t.columns,i=o.reset,r=o.change,s=o.add,o=o.remove;this.meta=f.mergeChanges(this.meta,function(t){return t.id},i,r,s,o),0!==this.depth||_.isEqual(t.breakdownColumns,this.breakdownColumns)||(this.breakdownColumns=t.breakdownColumns,this.removeChildren()),this.root=this.breakdownColumns[0]||"root",e.reset&&0<e.reset.length&&this.removeChildren(),n&&this.updateQueryStatus(this,n),this.hasDataFlag=!0,this.updateChildren()&&this.listener.updateDataSource(this)},f.prototype.subscribe=function(){this.api.subscribe(this.source,this.onData.bind(this))},f.prototype.updateDataSource=function(){this.listener.updateDataSource(this)},f.prototype.updateQueryStatus=function(t,e){this.listener.updateQueryStatus(this,e)},f.prototype.unsubscribe=function(){_.each(this.children,function(t,e){t.unsubscribe(),delete t[e]}),this.api.unsubscribe(this.source)},f.prototype.removeChild=function(t){t&&(t.unsubscribe(),this.children=_.without(this.children,t))},f.prototype.removeChildren=function(){var e=this;_.each(this.children,function(t){return e.removeChild(t)})},f.prototype.updateChildren=function(){var n=this;return!(this.breakdownColumns&&this.breakdownColumns.length&&this.depth<this.breakdownColumns.length-1&&(_.each(this.focus,function(e){var t;e.length>n.depth?((t=_.find(n.children,function(t){return t.getSource().id===e[n.depth]}))&&e[n.depth]!==t.getSource().id&&n.removeChild(t),t||(0!==n.depth&&(e[n.depth-1],n.source.id),(t=n.source.dataSet&&n.source.dataSet.collection.get(e[n.depth]))?(t=new f(t,n,n.api,[e],n.depth+1,n.breakdownColumns),n.children.push(t),t.subscribe()):console.debug("[DEBUG][DATASOURCE] -> onData missing focus",e[n.depth]))):(n.removeChildren(),n.focus.length!==n.depth||!n.hasDataFlag||0!==n.depth&&n.focus[n.depth-1]!==n.source.id||n.listener.updateDataSource(n))}),1))},f.BREAKDOWN_ID="{breakdownId}";var p,d=f;function f(t,e,n,o,i,r){this.breakdownColumns=[],this.meta={},this.hasDataFlag=!1,this.focus=[],this.api=n,this.breakdownColumns=r||this.breakdownColumns,this.children=[],this.depth=i||0,this.focus=o||[],this.listener=e,this.root="root",this.source=t,this.setFocus(o)}function g(t){var e=p.call(this,t)||this;return e.breakdownColumns=[],e.columnNames=[],e.columnTypes=[],e.keyColName="",e.valueColName="",e.api=t.api,e.aggregateColumn="",e.dataSource=null,e.$echart=$(),e.focus="",e.links=[],e.nodes=[],e.debouncedOnFocusChanged=_.debounce(e.onFocusChange.bind(e),500),e.render(),e.initializeChart(),e.generateOptions(),e.initializeEvents(),e.viewModel=new n.DeepModel({ordering:"null,null"}),e}return p=n.View,r(g,p),g.prototype.chartResize=function(){var t,e;this.chart&&(t=this.$el.innerWidth(),e=this.$el.innerHeight(),this.chart.resize({width:t,height:e}))},g.prototype.encodeKey=function(t){return _.isString(t)?t.replace(/,/g,"&#44;").replace(/\[/g,"&#91;").replace(/\]/g,"&#93;"):t},g.prototype.getPath=function(){return[]},g.prototype.onExpanded=function(n,o){var i,e=this,t=h.focus2Array(this.focus),t=_.filter(t,function(t){for(var e=0;e<n.length&&e<t.length&&t[e]===n[e];)e++;return e===n.length&&e<=t.length?(i=!0,o):!(e===t.length&&e<n.length)});o&&!i&&t.push(n),o||t.push(n.slice(0,-1)),t=1<(t=_.filter(t,function(t){return 0<t.length})).length?"["+_.map(t,function(t){return'"'+_.map(t,function(t){return e.encodeKey(t)}).join(",")+'"'}).join(",")+"]":1===t.length?_.map(t[0],function(t){return e.encodeKey(t)}).join(","):"",this.api.setProperty("Basics.Focus",t)},g.prototype.onResizeStop=function(){var t=this;_.debounce(function(){t.chartResize()},200)()},g.prototype.onSettingsChange=function(t){this.callIfDef(t,g.PROP_AGGREGATE_COLUMN,this.onAggregateColumnChange.bind(this)),this.callIfDef(t,g.PROP_DATA,this.onDataSourceChange.bind(this)),this.callIfDef(t,g.PROP_FOCUS,this.debouncedOnFocusChanged)},g.prototype.render=function(){return this.$el.html(u.app({})),this.$el.addClass("Sankey"),this.$echart=this.$el.find(".chart-area"),this},g.prototype.updateDataSource=function(){this.generateData(),this.generateOptions()},g.prototype.updateQueryStatus=function(t,e){e?this.api.showQueryStatus(e):this.api.hideQueryStatus()},g.prototype.initializeChart=function(){var t=this.$echart.get(0);this.destroyChart(),this.chart=e.init(t),this.chartResize()},g.prototype.initializeEvents=function(){var e=this;this.chart.on("click",function(t){e.onExpanded([t.data.path],!0)})},g.prototype.callIfDef=function(t,e,n){void 0!==t[e]&&n.call(this,t[e],e)},g.prototype.destroyChart=function(){var t=this.$echart.get(0);this.chart&&(this.chart.clear(),this.chart.dispose(t),delete this.chart)},g.prototype.generateData=function(){var i,r,s=this,t=new n.Collection;this.nodes=[],this.links=[];this.dataSource instanceof d&&(this.dataSource.getData(t),t.length)&&(i=this.chart.getHeight(),r=_.sumBy(t.models,function(t){return t.get(s.aggregateColumn)}),this.nodes.push({depth:0,name:this.dataSource.root}),t.forEach(function(n){var t,e=n.get(null==(e=s.dataSource)?void 0:e.breakdownColumns[n.depth]),o=(_.find(s.nodes,{name:e})||s.nodes.push({depth:n.depth+1,name:e}),0===n.depth&&s.links.push({source:null==(o=s.dataSource)?void 0:o.root,target:e,path:[e],value:(s.aggregateColumn?n.get(s.aggregateColumn):1)/r/i}),n.get(null==(o=s.dataSource)?void 0:o.breakdownColumns[n.depth-1]));_.isUndefined(o)||(t=_.times(n.depth,function(t){var e;return n.get(null==(e=s.dataSource)?void 0:e.breakdownColumns[t])}),e,s.links.push({source:o,target:e,path:t.concat([e]),value:(s.aggregateColumn?n.get(s.aggregateColumn):1)/r/i}))}))},g.prototype.generateOptions=function(){var t={title:{text:""},tooltip:{trigger:"item",triggerOn:"mouseover"},series:[{type:"sankey",data:this.nodes,links:this.links,focusNodeAdjacency:"allEdges",itemStyle:{normal:{color:"blue",borderWidth:1,borderColor:"white"}},levels:[{depth:0,itemStyle:{color:"#fbb4ae",lineStyle:{normal:{color:"White",curveness:.1}}},lineStyle:{color:"source",opacity:.6}},{depth:1,itemStyle:{color:"#b3cde3"},lineStyle:{color:"source",opacity:.6}}]}]};this.chart.setOption(t)},g.prototype.getFocusKeys=function(){var t=h.focus2Array(this.focus),n=this.getPath(),o=[];return t.forEach(function(t){for(var e=0;e<n.length&&e<t.length&&n[e]===t[e];e++);e===n.length&&e<t.length&&o.push(t[e])}),o},g.prototype.onAggregateColumnChange=function(t){this.aggregateColumn=t,this.generateData(),this.generateOptions()},g.prototype.onDataSourceChange=function(t){var e,n=this;t&&this.dataSource&&this.dataSource.getSource().cid!==t.cid&&(e=this.dataSource.getSource())&&(this.stopListening(e),this.dataSource.unsubscribe()),t?(this.dataSource=new d(t,this,this.api,this.focus||[""][""]),this.listenTo(t,"change:queryStatus",function(t,e){n.updateQueryStatus(n.dataSource,e)}),this.dataSource.subscribe()):this.dataSource&&this.dataSource.hasData()&&this.updateDataSource()},g.prototype.onFocusChange=function(t){this.focus=t,this.dataSource&&this.dataSource.setFocus(_.first(h.focus2Array(this.focus))||[]),this.generateData(),this.generateOptions()},g.prototype.unsubscribe=function(){this.api.unsubscribe(this.dataSource)},g.getComponentDefinition=s.getComponentDefinition,g.PROP_DATA="Basics.Data",g.PROP_AGGREGATE_COLUMN="Basics.AggregateColumn",g.PROP_FOCUS="Basics.Focus",g});