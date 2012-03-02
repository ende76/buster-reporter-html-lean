(function () {
	var isNodeJS = typeof module === "object" && typeof require === "function";

	if (isNodeJS) {
		buster = require("buster/node_modules/buster-core");
		var
			jsdom = require("jsdom").jsdom,
			htmlReporter = require("buster/node_modules/buster-test").reporters.html;
	}

	var htmlLeanReporter = buster.extend({}, htmlReporter, {
		contextStart: function (context) {
			if (this.contexts.length === 0) {
				this.lastContext = this.lastContext || {};
				if (context.name === this.lastContext.name) {
					this._list = null;
				} else {
					this.root.appendChild(el(this.doc, "h2", { text: context.name }));
				}
				this.lastContext.name = context.name;
				this.contextStatus = "success";
			}

			this.startedAt = new Date();
			this.contexts.push(context.name);
		},

		contextEnd: function (context) {
			this.contexts.pop();
			if (this.contexts.length === 1 && this.contextStatus === "success") {
				addListItem.call(this, "h3", { "name": context.name }, this.contextStatus);
			}
		},

		testSuccess: function (test) {
		},

		testFailure: function (test) {
			var li = addListItem.call(this, "h3", test, "failure");
			this.addMessages(li);
			addException(li, test.error);
			this.contextStatus = "failure";
		},
		
		testDeferred: function (test) {
			var li = addListItem.call(this, "h3", test, "deferred");
			this.contextStatus = "deferred";
		},

		testError: function (test) {
			var li = addListItem.call(this, "h3", test, "error");
			this.addMessages(li);
			this.contextStatus = "error";
			addException(li, test.error);
		}
	});

	function addException(li, error) {
		if (!error) {
			return;
		}

		var name = error.name == "AssertionError" ? "" : error.name + ": ";

		li.appendChild(el(li.ownerDocument || document, "p", {
			innerHTML: name + error.message,
			className: "error-message"
		}));

		var stack = buster.stackFilter(error.stack) || [];

		if (stack.length > 0) {
			if (stack[0].indexOf(error.message) >= 0) {
				stack.shift();
			}

			li.appendChild(el(li.ownerDocument || document, "ul", {
				className: "stack",
				innerHTML: "<li>" + stack.join("</li><li>") + "</li>"
			}));
		}
	}

	function addListItem(tagName, test, className) {
		var
			prefix = tagName ? "<" + tagName + ">" : "",
			suffix = tagName ? "</" + tagName + ">" : "",
			name = this.contexts.slice(1).join(" ") + " " + test.name,
			item = el(this.doc, "li", {
				className: className,
				text: prefix + name.replace(/^\s+|\s+$/, "") + suffix
			});

		this.list().appendChild(item);
		return item;
	}

	function el(doc, tagName, properties) {
		var el = doc.createElement(tagName), value;

		for (var prop in properties) {
			value = properties[prop];

			if (prop == "http-equiv") {
				el.setAttribute(prop, value);
			}

			if (prop == "text") {
				prop = "innerHTML";
			}

			el[prop] = value;
		}

		return el;
	}

	if (typeof module == "object" && module.exports) {
		module.exports = htmlLeanReporter;
	} else {
		buster.reporters = buster.reporters || {};
		buster.reporters.htmlLean = htmlLeanReporter;
	}
}());