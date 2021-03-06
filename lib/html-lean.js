(function () {
	var
		isNodeJS = typeof module === "object" && typeof require === "function",
		htmlReporter,
		htmlLeanReporter;

	if (isNodeJS) {
		buster = require("buster/node_modules/buster-core");
		htmlReporter = require("buster/node_modules/buster-test").reporters.html;
	} else {
		htmlReporter = buster.reporters.html;
	}

	htmlLeanReporter = buster.extend({}, htmlReporter, {
		contextStart: function (context) {
			if (this.contexts.length === 0) {
				this.lastContext = this.lastContext || {};
				if (context.name !== this.lastContext.name) {
					this.root.appendChild(el(this.doc, "h2", { text: context.name }));
				}
				this.lastContext.name = context.name;
				this.contextStatus = "success";
			}

			this.startedAt = new Date();
			this.contexts.push(context.name);
		},

		contextEnd: function (context) {
			htmlReporter.contextEnd.call(this, context);
			if (this.contexts.length === 1 && this.contextStatus === "success") {
				addListItem.call(this, "h3", context, this.contextStatus);
			}
		},

		testSuccess: function (test) {
		},

		testFailure: function (test) {
			htmlReporter.testFailure.call(this, test);
			this.contextStatus = "failure";
		},

		testDeferred: function (test) {
			htmlReporter.testDeferred.call(this, test);
			this.contextStatus = "deferred";
		},

		testError: function (test) {
			htmlReporter.testError.call(this, test);
			this.contextStatus = "error";
		}
	});

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
		var
			el = doc.createElement(tagName),
			prop, value;

		for (prop in properties) {
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