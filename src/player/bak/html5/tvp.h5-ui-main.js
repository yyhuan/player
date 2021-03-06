/**
 * @fileOverview 播放器 HTML5播放器 控制栏
 *
 */

;
(function(x, $) {
	var $me;
	/**
	 * HTML5播放器控制栏
	 */
	x.Html5UI = function(player) {
		this.player = player;
		this.videoTag = player.getPlayer();
		this.$video = player.$video;
		this.$mod = player.$mod;
		this.$UILayer = null;
		this.$control = null;
		this.feature = player.config.html5VodUIFeature;
		$me = this;

		this.elements = {}
		this.constvars = {
			progressWidth: 0
		}
	}

	x.Html5UI.fn = x.Html5UI.prototype = {
		getCurVideo: function() {
			return this.player.getCurVideo();
		},
		init: function() {
			this.initDom();
			this.controlReady();
		},

		initDom: function() {
			this.$UILayer = this.$mod.find(x.html5skin.elements.layer);
			this.$control = this.$UILayer.find(x.html5skin.elements.control);

		},
		controlReady: function() {
			var t = this;

			function invoke(v) {
				try {
					var evtName = "build" + v;
					if ($.isFunction(t[evtName])) {
						t[evtName](t.player, t.$video, t.$control, t.$UILayer);
					}
				} catch (err) {}
			}

			$.each(this.feature, function(i, v) {
				if (!t.player.isForbiddenH5UIFeature(v)) {
					if (v in t.player.config.html5FeatureExtJS) {
						$.ajax({
							url: t.player.config.html5FeatureExtJS[v] + "?v=" + new Date().valueOf(),
							dataType: "script",
							success: function() {
								invoke(v);
							}
						});
					} else {
						invoke(v);
					}
				}
			});

			//如果使用了自定义的控制栏，才有后面的这些点击操作隐藏控制栏或者展现控制栏
			if (this.player.isUseH5UIFeature("controlbar")) {

				//如果不是设置为永远显示控制栏，就要做自动化隐藏逻辑
				if (!this.player.config.isHtml5ControlAlwaysShow) {
					this.$video.on(t.getClickName(), function(e) {
						if (t.isHidden()) {
							t.show();
							t.beginHide(8e3);; //显示了控制栏以后倒计时8秒，8秒内啥都不做，直接关闭，除非点击了其他控制区域
						} else {
							t.hide();
						}
						e.preventDefault();
						e.stopPropagation();
					});

					// this.$UILayer.on("touchstart", function(e) {
					// 	var evt = !! e.originalEvent ? e.originalEvent : e;
					// 	if (evt.srcElement.tagName == "VIDEO") {
					// 		return;
					// 	}
					// 	t.stopHide();
					// }).on("touchend", function(e) {
					// 	var evt = !! e.originalEvent ? e.originalEvent : e;
					// 	if (evt.srcElement.tagName == "VIDEO") {
					// 		return;
					// 	}
					// 	t.beginHide();
					// });

					this.hideControlTimer = 0;
					this.$video.on("play", function() { //开始播放时倒计时隐藏控制栏
						t.beginHide();
					}).on("pause paused", function() {
						t.show();
					});
				}
			}
		},
		beginHide: function(time) {
			var t = this;
			time = time || 5e3;
			this.stopHide();
			this.hideControlTimer = setTimeout(function() {
				t.hide();
			}, time);

		},
		stopHide: function() {
			if (this.hideControlTimer) {
				clearTimeout(this.hideControlTimer);
				this.hideControlTimer = 0;
			}
		},
		hide: function() {
			this.$UILayer.addClass("x_controls_hide");
			this.$control.trigger("x:control:hide");
		},
		show: function() {
			if (this.hideControlTimer) {
				clearTimeout(this.hideControlTimer);
				this.hideControlTimer = 0;
			}

			this.$UILayer.removeClass("x_controls_hide");
			this.$control.trigger("x:control:show");
		},
		isHidden: function() {
			return this.$UILayer.hasClass("x_controls_hide");
		},
		/**
		 * 获取总时长
		 * @return {[type]} [description]
		 */
		getDuration: function() {
			return this.player.getDuration();
		},
		/**
		 * 按钮点击事件名称
		 * @return {[type]} [description]
		 */
		getClickName: function() {
			return $.os.hasTouch ? "tap" : "click";
		}
	}

})(x, x.$);