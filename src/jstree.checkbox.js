/**
 * ### Checkbox plugin
 */
(function ($) {
	var _i = document.createElement('I');
	_i.className = 'jstree-icon jstree-checkbox';
	$.jstree.defaults.checkbox = {
		visible				: true,
		three_state			: true,
		whole_node			: true,
		keep_selected_style	: true
	};
	$.jstree.plugins.checkbox = function (options, parent) {
		this.bind = function () {
			parent.bind.call(this);
			this._data.checkbox.uto = false;
			this.element
				.on("init.jstree", $.proxy(function () {
						this._data.checkbox.visible = this.settings.checkbox.visible;
						if(!this.settings.checkbox.keep_selected_style) {
							this.element.addClass('jstree-checkbox-no-clicked');
						}
					}, this))
				.on("loading.jstree", $.proxy(function () {
						this[ this._data.checkbox.visible ? 'show_checkboxes' : 'hide_checkboxes' ]();
					}, this));
			if(this.settings.checkbox.three_state) {
				this.element
					.on('changed.jstree move_node.jstree copy_node.jstree redraw.jstree open_node.jstree', $.proxy(function () {
							if(this._data.checkbox.uto) { clearTimeout(this._data.checkbox.uto); }
							this._data.checkbox.uto = setTimeout($.proxy(this._undetermined, this), 50);
						}, this))
					.on('model.jstree', $.proxy(function (e, data) {
							var m = this._model.data,
								p = m[data.parent],
								par = data.parent,
								dpc = data.nodes,
								chd = [],
								c, i, j, k, l, tmp;

							// apply down
							if(p.state.selected) {
								for(i = 0, j = dpc.length; i < j; i++) {
									m[dpc[i]].state.selected = true;
								}
								this._data.core.selected = this._data.core.selected.concat(dpc);
							}
							else {
								for(i = 0, j = dpc.length; i < j; i++) {
									if(m[dpc[i]].state.selected) {
										for(k = 0, l = m[dpc[i]].children_d.length; k < l; k++) {
											m[m[dpc[i]].children_d[k]].state.selected = true;
										}
										this._data.core.selected = this._data.core.selected.concat(m[dpc[i]].children_d);
									}
								}
							}

							// apply up
							for(i = 0, j = p.children_d.length; i < j; i++) {
								if(!m[p.children_d[i]].children.length) {
									chd.push(m[p.children_d[i]].parent);
								}
							}
							chd = $.vakata.array_unique(chd);
							for(k = 0, l = chd.length; k < l; k++) {
								p = m[chd[k]];
								while(p && p.id !== '#') {
									c = 0;
									for(i = 0, j = p.children.length; i < j; i++) {
										c += m[p.children[i]].state.selected;
									}
									if(c === j) {
										p.state.selected = true;
										this._data.core.selected.push(p.id);
										tmp = this.get_node(p, true);
										if(tmp && tmp.length) {
											tmp.children('.jstree-anchor').addClass('jstree-clicked');
										}
									}
									else {
										break;
									}
									p = this.get_node(p.parent);
								}
							}
							this._data.core.selected = $.vakata.array_unique(this._data.core.selected);
						}, this))
					.on('select_node.jstree', $.proxy(function (e, data) {
							var obj = data.node,
								m = this._model.data,
								par = this.get_node(obj.parent),
								dom = this.get_node(obj, true),
								i, j, c, tmp;
							this._data.core.selected = $.vakata.array_unique(this._data.core.selected.concat(obj.children_d));
							for(i = 0, j = obj.children_d.length; i < j; i++) {
								m[obj.children_d[i]].state.selected = true;
							}
							while(par && par.id !== '#') {
								c = 0;
								for(i = 0, j = par.children.length; i < j; i++) {
									c += m[par.children[i]].state.selected;
								}
								if(c === j) {
									par.state.selected = true;
									this._data.core.selected.push(par.id);
									tmp = this.get_node(par, true);
									if(tmp && tmp.length) {
										tmp.children('.jstree-anchor').addClass('jstree-clicked');
									}
								}
								else {
									break;
								}
								par = this.get_node(par.parent);
							}
							if(dom.length) {
								dom.find('.jstree-anchor').addClass('jstree-clicked');
							}
						}, this))
					.on('deselect_node.jstree', $.proxy(function (e, data) {
							var obj = data.node,
								m = this._model.data,
								dom = this.get_node(obj, true),
								i, j, tmp;
							for(i = 0, j = obj.children_d.length; i < j; i++) {
								this._model.data[obj.children_d[i]].state.selected = false;
							}
							for(i = 0, j = obj.parents.length; i < j; i++) {
								this._model.data[obj.parents[i]].state.selected = false;
								tmp = this.get_node(obj.parents[i], true);
								if(tmp && tmp.length) {
									tmp.children('.jstree-anchor').removeClass('jstree-clicked');
								}
							}
							tmp = [];
							for(i = 0, j = this._data.core.selected.length; i < j; i++) {
								if($.inArray(this._data.core.selected[i], obj.children_d) === -1 && $.inArray(this._data.core.selected[i], obj.parents) === -1) {
									tmp.push(this._data.core.selected[i]);
								}
							}
							this._data.core.selected = $.vakata.array_unique(tmp);
							if(dom.length) {
								dom.find('.jstree-anchor').removeClass('jstree-clicked');
							}
						}, this))
					.on('delete_node.jstree', $.proxy(function (e, data) {
							var p = this.get_node(data.parent),
								m = this._model.data,
								i, j, c, tmp;
							while(p && p.id !== '#') {
								c = 0;
								for(i = 0, j = p.children.length; i < j; i++) {
									c += m[p.children[i]].state.selected;
								}
								if(c === j) {
									p.state.selected = true;
									this._data.core.selected.push(p.id);
									tmp = this.get_node(p, true);
									if(tmp && tmp.length) {
										tmp.children('.jstree-anchor').addClass('jstree-clicked');
									}
								}
								else {
									break;
								}
								p = this.get_node(p.parent);
							}
						}, this))
					.on('move_node.jstree', $.proxy(function (e, data) {
							var is_multi = data.is_multi,
								old_par = data.old_parent,
								new_par = this.get_node(data.parent),
								m = this._model.data,
								p, c, i, j, tmp;
							if(!is_multi) {
								p = this.get_node(old_par);
								while(p && p.id !== '#') {
									c = 0;
									for(i = 0, j = p.children.length; i < j; i++) {
										c += m[p.children[i]].state.selected;
									}
									if(c === j) {
										p.state.selected = true;
										this._data.core.selected.push(p.id);
										tmp = this.get_node(p, true);
										if(tmp && tmp.length) {
											tmp.children('.jstree-anchor').addClass('jstree-clicked');
										}
									}
									else {
										break;
									}
									p = this.get_node(p.parent);
								}
							}
							p = new_par;
							while(p && p.id !== '#') {
								c = 0;
								for(i = 0, j = p.children.length; i < j; i++) {
									c += m[p.children[i]].state.selected;
								}
								if(c === j) {
									if(!p.state.selected) {
										p.state.selected = true;
										this._data.core.selected.push(p.id);
										tmp = this.get_node(p, true);
										if(tmp && tmp.length) {
											tmp.children('.jstree-anchor').addClass('jstree-clicked');
										}
									}
								}
								else {
									if(p.state.selected) {
										p.state.selected = false;
										this._data.core.selected = $.vakata.array_remove(this._data.core.selected, $.inArray(p.id, this._data.core.selected));
										tmp = this.get_node(p, true);
										if(tmp && tmp.length) {
											tmp.children('.jstree-anchor').removeClass('jstree-clicked');
										}
									}
									else {
										break;
									}
								}
								p = this.get_node(p.parent);
							}
						}, this));
			}
		};
		this._undetermined = function () {
			var i, j, m = this._model.data, s = this._data.core.selected, p = [];
			for(i = 0, j = s.length; i < j; i++) {
				p = p.concat(m[s[i]].parents);
			}
			p = $.vakata.array_unique(p);
			i = $.inArray('#', p);
			if(i !== -1) {
				p = $.vakata.array_remove(p, i);
			}
			this.element.find('.jstree-undetermined').removeClass('jstree-undetermined');
			for(i = 0, j = p.length; i < j; i++) {
				if(!m[p[i]].state.selected) {
					s = this.get_node(p[i], true);
					if(s && s.length) {
						s.children('a').children('.jstree-checkbox').addClass('jstree-undetermined');
					}
				}
			}
		};
		this.redraw_node = function(obj, deep, is_callback) {
			obj = parent.redraw_node.call(this, obj, deep, is_callback);
			if(obj) {
				var tmp = obj.getElementsByTagName('A')[0];
				tmp.insertBefore(_i.cloneNode(), tmp.childNodes[0]);
			}
			if(!is_callback && this.settings.checkbox.three_state) {
				if(this._data.checkbox.uto) { clearTimeout(this._data.checkbox.uto); }
				this._data.checkbox.uto = setTimeout($.proxy(this._undetermined, this), 50);
			}
			return obj;
		};
		this.activate_node = function (obj, e) {
			if(this.settings.checkbox.whole_node || $(e.target).hasClass('jstree-checkbox')) {
				e.ctrlKey = true;
			}
			return parent.activate_node.call(this, obj, e);
		};
		/**
		 * `show_checkboxes()`
		 */
		this.show_checkboxes = function () { this._data.core.themes.checkboxes = true; this.element.children("ul").removeClass("jstree-no-checkboxes"); };
		/**
		 * `hide_checkboxes()`
		 */
		this.hide_checkboxes = function () { this._data.core.themes.checkboxes = false; this.element.children("ul").addClass("jstree-no-checkboxes"); };
		/**
		 * `toggle_checkboxes()`
		 */
		this.toggle_checkboxes = function () { if(this._data.core.themes.checkboxes) { this.hide_checkboxes(); } else { this.show_checkboxes(); } };
	};

	// include the checkbox plugin by default
	// $.jstree.defaults.plugins.push("checkbox");
})(jQuery);