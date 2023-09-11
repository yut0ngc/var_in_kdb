define(["backbone","Handlebars","QuickBase","css!./css/main.css"],function(e,t,o){"use strict";var n,i=this&&this.__extends||(n=function(t,e){return(n=Object.setPrototypeOf||({__proto__:[]}instanceof Array?function(t,e){t.__proto__=e}:function(t,e){for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(t[i]=e[i])}))(t,e)},function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function i(){this.constructor=t}n(t,e),t.prototype=null===e?Object.create(e):(i.prototype=e.prototype,new i)}),s=(r.getComponentDefinition=function(t){if(0<_.keys(t.settingsModel.attributes).length)for(var e=_.find(r.upgrades,{version:t.settingsModel.get("version")}),i=void 0===e?1:r.upgrades.indexOf(e)+1;i<r.upgrades.length;i+=1){var o=r.upgrades[i];o.fn(t.settingsModel),t.settingsModel.set("version",o.version)}return{id:1011,componentName:"Flex Panel",componentDescription:"group two components together with a panel",appKey:"FlexPanel",disable_array_reorder:!0,appArgs:{json:{version:"4.3.0",Basics:{layout:"horizontaltop",maxSize:0,minSize:250},Style:{advanced:""}},schema:{type:"object",title:"Properties",properties:{Basics:{type:"object",title:"Basics",options:{disable_array_reorder:!0},properties:{layout:{type:"string",title:"Orientation",enum:["horizontaltop","verticalleft","verticalright","horizontalbottom"],options:{enum_titles:["Horizontal Top","Vertical Left","Vertical Right","Horizontal Bottom"]},default:"horizontaltop"},minSize:{type:"number",title:"Min Size"},maxSize:{type:"number",title:"Max Size"}}},Style:{type:"object",title:"Style",options:{collapsed:!0},properties:{advanced:{type:"css",title:"Advanced CSS",default:""}}}}}}}},r.upgrades=[{version:0,fn:function(t){}}],r);function r(){}l.app=t.template({compiler:[8,">= 4.3.0"],main:function(t,e,i,o,n){var s=t.lookupProperty||function(t,e){if(Object.prototype.hasOwnProperty.call(t,e))return t[e]};return'<div class="worksheet">\n    <div class="grid-stack">\n        <div class=\'advanced-item two placeholder\'></div>\n    </div>\n    <div class="no-widgets-info">\n        <div class="loading">'+t.escapeExpression((s(i,"t")||e&&s(e,"t")||t.hooks.helperMissing).call(null!=e?e:t.nullContext||{},"start dragging widgets from the panel on your left",{name:"t",hash:{},data:n,loc:{start:{line:6,column:29},end:{line:6,column:87}}}))+'</div>\n\n        <div class="dragComponentsHelp">\n            <i class="fa fa-chevron-right"></i>\n            <i class="fa fa-chevron-right"></i>\n            <i class="fa fa-chevron-right"></i>\n        </div>\n    </div>\n</div>\n<div class="visual-indicator"></div>'},useData:!0});var a,d=l;function l(){}function h(t){t=a.call(this,t)||this;return t.api=null,t.isGridstack=!1,t.selected=null,t.hasInitPost=!1,t.removing=!1,t}return a=o.ComponentDropView,i(h,a),h.prototype.initialize=function(t){this.panelId=_.uniqueId("flexpanel"),this.api=t.api,this.componentModel=t.componentModel,this.dashboardAppModel=t.dashboardAppModel,this.dashboardViewModel=t.dashboardViewModel,this.quickView=t.quickView,this.websiteUrl=t.websiteUrl,this.events=null,this.model||(this.model=this.componentModel),this.viewModel=new e.DeepModel,this.widgets=[],this.postRender()},h.prototype.initializeEvents=function(){var t=this;this.$worksheet&&(this.$worksheet.on("dragover",this.getSafeDragNDropHandler(this.onWorksheetDragOver)),this.$worksheet.on("dragleave",this.getSafeDragNDropHandler(this.onWorksheetDragLeave)),this.$worksheet.on("drop",this.getSafeDragNDropHandler(this.onWorksheetDrop))),this.listenTo(this.viewModel,"change:Basics.layout",this.onLayoutChanged),this.listenTo(this.viewModel,"change:Basics.maxSize",this.onSizeLimitChanged),this.listenTo(this.viewModel,"change:Basics.minSize",this.onSizeLimitChanged),this.listenTo(this.dashboardViewModel,"change:selectedWidget",this.onSelectedWidgetChanged),this.listenTo(this.dashboardViewModel,"change:buildMode",function(){return t.switchBuildMode(t.dashboardViewModel.get("buildMode"))}),this.listenTo(this.dashboardAppModel,"change:pendingSelectionWidgetId",this.onSelectingWidget),this.initializeEvents_widgetCollection()},h.prototype.initializePost=function(){this.hasInitPost||(this.hasInitPost=!0,this.horizontalStyles=document.createElement("style"),this.horizontalStyles.type="text/css",document.head.appendChild(this.horizontalStyles),this.verticalStyles=document.createElement("style"),this.verticalStyles.type="text/css",document.head.appendChild(this.verticalStyles),this.widgetsCollection=this.model.get("widgets"),this.initializeEvents(),this.clearPanel(this.applyCurrentPanel.bind(this)),this.switchBuildMode(this.dashboardViewModel.get("buildMode")),this.onLayoutChanged(),this.onSizeLimitChanged())},h.prototype.addWidget=function(t,e,i){return this.noWidgetsInfo&&(this.noWidgetsInfo.style.display="none"),this.visualIndicator&&(this.visualIndicator.style.display="none"),o.ComponentDropView.prototype.addWidget.apply(this,[t,e,i])},h.prototype.addWidgetEvents=function(t){var e,i=this;if(!(t instanceof $))throw"Wrong parameter.";_.each(t,function(t){(e=$(t)).on("click",$.proxy(i.onWidgetClick,i)),e.on("dragenter",i.getSafeDragNDropHandler(i.onComponentDragEnter)),e.on("dragleave",i.getSafeDragNDropHandler(i.onComponentDragLeave)),e.on("dragover",i.getSafeDragNDropHandler(i.onComponentDragOver)),e.on("drop",i.getSafeDragNDropHandler(i.onComponentDrop))})},h.prototype.applyCurrentPanel=function(){var e=this;this.isGridstack=!1,this.widgetsCollection.each(function(t){e.addWidget(t,!0,null)})},h.prototype.clearPanel=function(t){this.clearWidgets(function(){t&&t()})},h.prototype.clearWidgets=function(t){_.includes(this.model.get("widgets").map("id"),this.dashboardViewModel.get("selectedWidgetId"))&&this.deselectCurrentWidget(),0<this.widgets.length&&(_.each(this.widgets,function(t){t.view&&_.isFunction(t.view.remove)&&t.view.remove()}),this.widgets=[],this.$gridstack.children().remove()),t&&t()},h.prototype.getWidgetClass=function(t){var e="one";return 1===this.widgets.length&&(e="two",0===t)&&(this.widgets[0].$widget.removeClass(e="one"),this.widgets[0].$widget.addClass("two")),"ui-widget "+e},h.prototype.onComponentDragOver=function(t){if(!_.includes(t.originalEvent.dataTransfer.types,"Files"))return $(t.currentTarget).toggleClass("highlight",!0),!1},h.prototype.onComponentDragEnter=function(t){var e;if(!_.includes(t.originalEvent.dataTransfer.types,"Files"))return e=t.currentTarget.getAttribute("data-widgetid"),this.model.get("widgets").get(e).get("component")||$(t.currentTarget).toggleClass("highlight",!0),!1},h.prototype.onComponentDragLeave=function(t){return $(t.currentTarget).toggleClass("highlight",!1),!1},h.prototype.onComponentDrop=function(t){var e;return this.onComponentDragLeave(t),void 0!==t.originalEvent.dataTransfer&&(e=t.originalEvent.dataTransfer.getData("text"),this.dashboardAppModel.get("components").get(e))&&(t=$(t.currentTarget).attr("data-widgetid"),t=this.findWidgetItem(t),this.dashboardViewModel.set("selectedWidget",null),t?this.addComponentToWidget(t.model,e,!0):this.addNewWidget(null,e,!1)),!1},h.prototype.onComponentDropWrap=function(t){var e=t.originalEvent.dataTransfer.getData("text");return t.preventDefault&&(t.preventDefault(),t.stopPropagation()),this.dashboardAppModel&&this.dashboardAppModel.get("components").has(e)&&this.addNewWidget(null,e,!1),!1},h.prototype.onLayoutChanged=function(){this.visualIndicator.classList.remove("horizontaltop"),this.visualIndicator.classList.remove("verticalleft"),this.visualIndicator.classList.remove("verticalright"),this.visualIndicator.classList.remove("horizontalbottom"),this.el.classList.remove("horizontaltop"),this.el.classList.remove("verticalleft"),this.el.classList.remove("verticalright"),this.el.classList.remove("horizontalbottom"),this.visualIndicator.classList.add(this.viewModel.get("Basics.layout")),this.el.classList.add(this.viewModel.get("Basics.layout"))},h.prototype.onResize=function(){this.onResizeWidgets()},h.prototype.onResizeWidgets=function(){_.each(this.widgets,function(t){t.view&&(_.isFunction(t.view.onResize)&&t.view.onResize(!0),_.isFunction(t.view.onResizeStop))&&t.view.onResizeStop(!0)})},h.prototype.onSelectingWidget=function(t,e){t&&(this.onWidgetClick(null,e),this.dashboardAppModel.set("pendingSelectionWidgetId",null,{silent:!0}))},h.prototype.onSelectedWidgetChanged=function(t,e){t=t.get("selectedWidgetId");this.$el.find(".advanced-item.selected").toggleClass("selected",!1),t&&this.$el.find(".advanced-item[data-widgetid='"+t+"']").toggleClass("selected",!0)},h.prototype.onSettingsChange=function(t){var i=this;_.each(t,function(t,e){i.viewModel.set(e,t)}),this.initializePost()},h.prototype.onSizeLimitChanged=function(){var t="#"+this.panelId+".flex-panel",e=">.worksheet>.grid-stack>.advanced-item.one>.grid-stack-item-content>.component-build-view>.border-div>.app-div",i=this.viewModel.get("Basics.minSize"),o=this.viewModel.get("Basics.maxSize"),n=t+".horizontaltop"+e+","+t+".horizontalbottom"+e+"{",t=t+".verticalleft"+e+","+t+".verticalright"+e+"{";i&&(n+="min-height: "+i+"px;",t+="min-width: "+i+"px;"),o&&(n+="max-height: "+o+"px;",t+="max-width: "+o+"px;"),t+="height: 100%;}",this.horizontalStyles.innerHTML=n+="width: 100%;}",this.verticalStyles.innerHTML=t,this.onResize()},h.prototype.onWidgetCollectionAdd=function(t,e,i){i=i&&i.at;this.addWidget(t,!1,i)},h.prototype.onWorksheetDragLeave=function(t){return!(this.placeholder.style.display="none")},h.prototype.onWorksheetDragOver=function(t){return!(this.placeholder.style.display="block")},h.prototype.onWorksheetDrop=function(t){return this.placeholder.style.display="none",this.deselectCurrentWidget(),this.widgets.length<2&&this.onComponentDropWrap(t),!1},h.prototype.pasteWidget=function(t){2===this.widgets.length&&this.removeWidget(this.widgets[1]),t.setParent(this.widgetsCollection);this.addNewWidget(t,t.get("component").get("definitionId"),!0)},h.prototype.remove=function(){var t=this;this.removing||(this.removing=!0,this.horizontalStyles&&(this.horizontalStyles.remove(),this.horizontalStyles=null),this.verticalStyles&&(this.verticalStyles.remove(),this.verticalStyles=null),this.stopListening(),this.$worksheet&&this.$worksheet.off(),this.clearPanel(function(){t.removeCallbacks=[],t.$el.remove(),t.removing=!1})),e.View.prototype.remove.apply(this)},h.prototype.removeWidget=function(t){t=this.findWidgetItem(t.id);t&&(this.widgets=_.without(this.widgets,t),this.widgets.length<=0?(this.noWidgetsInfo.style.display="block",this.visualIndicator.style.display="block"):1===this.widgets.length&&this.widgets[0].$widget.hasClass("two")&&(this.widgets[0].$widget.toggleClass("two",!1),this.widgets[0].$widget.toggleClass("one",!0)),this.quickView||this.model.get("widgets").remove(t.model),t.$widget.css({border:"none",background:"none","box-shadow":"none","pointer-events":"none"}),t.view&&t.view.remove&&t.view.remove(),t.$widget.off(),t.$widget.remove())},h.prototype.postRender=function(){return this.el.classList.add("flex-panel"),this.el.setAttribute("id",this.panelId),this.el.innerHTML=d.app({}),this.$worksheet=this.$el.find("> .worksheet"),this.worksheet=this.el.querySelector(".worksheet"),this.gridstack=this.worksheet.querySelector(".grid-stack"),this.$gridstack=this.$worksheet.find("> .grid-stack"),this.noWidgetsInfo=this.worksheet.querySelector(".no-widgets-info"),this.visualIndicator=this.el.querySelector(".visual-indicator"),this.placeholder=this.gridstack.querySelector(".placeholder"),this},h.prototype.renderComponent=function(t,e){e=this.createComponentView(t,e),e=$("<div/>",{class:"grid-stack-item-content"}).append(e.$el);t.$widget.append(e)},h.prototype.renderWidget=function(){var t=$('<div class="advanced-item"><div class="drop-show"></div></div>');return this.$gridstack&&this.$gridstack.append(t),t},h.prototype.setTheme=function(e){_.each(this.widgets,function(t){t.view.app&&t.view.app.setTheme&&t.view.app.setTheme(e)})},h.prototype.switchOffBuildMode=function(t){o.ComponentDropView.prototype.switchOffBuildMode.apply(this,[t]),this.$gridstack&&this.$gridstack.find("> div").addClass("build-off")},h.prototype.switchOnBuildMode=function(t){o.ComponentDropView.prototype.switchOnBuildMode.apply(this,[t]),this.$gridstack&&this.$gridstack.find("> div").removeClass("build-off")},h.getComponentDefinition=s.getComponentDefinition,h});