
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* ..\src\Confetti.svelte generated by Svelte v3.42.1 */

    const file$2 = "..\\src\\Confetti.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (29:2) {#each { length: amount } as _}
    function create_each_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "confetti svelte-nyk7y3");
    			set_style(div, "--fall-distance", /*fallDistance*/ ctx[8]);
    			set_style(div, "--size", /*size*/ ctx[0] + "px");
    			set_style(div, "--color", /*getColor*/ ctx[11]());
    			set_style(div, "--skew", randomBetween(-45, 45) + "deg," + randomBetween(-45, 45) + "deg");
    			set_style(div, "--rotation-xyz", randomBetween(-10, 10) + ", " + randomBetween(-10, 10) + ", " + randomBetween(-10, 10));
    			set_style(div, "--rotation-deg", randomBetween(0, 360) + "deg");
    			set_style(div, "--translate-y-multiplier", randomBetween(/*y*/ ctx[2][0], /*y*/ ctx[2][1]));
    			set_style(div, "--translate-x-multiplier", randomBetween(/*x*/ ctx[1][0], /*x*/ ctx[1][1]));
    			set_style(div, "--scale", 0.1 * randomBetween(2, 10));

    			set_style(div, "--transition-duration", /*infinite*/ ctx[4]
    			? `calc(${/*duration*/ ctx[3]}ms * var(--scale))`
    			: `${/*duration*/ ctx[3]}ms`);

    			set_style(div, "--transition-delay", randomBetween(/*delay*/ ctx[5][0], /*delay*/ ctx[5][1]) + "ms");

    			set_style(div, "--transition-iteration-count", /*infinite*/ ctx[4]
    			? 'infinite'
    			: /*iterationCount*/ ctx[7]);

    			add_location(div, file$2, 29, 4, 830);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fallDistance*/ 256) {
    				set_style(div, "--fall-distance", /*fallDistance*/ ctx[8]);
    			}

    			if (dirty & /*size*/ 1) {
    				set_style(div, "--size", /*size*/ ctx[0] + "px");
    			}

    			if (dirty & /*y*/ 4) {
    				set_style(div, "--translate-y-multiplier", randomBetween(/*y*/ ctx[2][0], /*y*/ ctx[2][1]));
    			}

    			if (dirty & /*x*/ 2) {
    				set_style(div, "--translate-x-multiplier", randomBetween(/*x*/ ctx[1][0], /*x*/ ctx[1][1]));
    			}

    			if (dirty & /*infinite, duration*/ 24) {
    				set_style(div, "--transition-duration", /*infinite*/ ctx[4]
    				? `calc(${/*duration*/ ctx[3]}ms * var(--scale))`
    				: `${/*duration*/ ctx[3]}ms`);
    			}

    			if (dirty & /*delay*/ 32) {
    				set_style(div, "--transition-delay", randomBetween(/*delay*/ ctx[5][0], /*delay*/ ctx[5][1]) + "ms");
    			}

    			if (dirty & /*infinite, iterationCount*/ 144) {
    				set_style(div, "--transition-iteration-count", /*infinite*/ ctx[4]
    				? 'infinite'
    				: /*iterationCount*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(29:2) {#each { length: amount } as _}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let each_value = { length: /*amount*/ ctx[6] };
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "confetti-holder svelte-nyk7y3");
    			toggle_class(div, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(div, "cone", /*cone*/ ctx[10]);
    			add_location(div, file$2, 27, 0, 735);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fallDistance, size, getColor, randomBetween, y, x, infinite, duration, delay, iterationCount, amount*/ 2559) {
    				each_value = { length: /*amount*/ ctx[6] };
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*rounded*/ 512) {
    				toggle_class(div, "rounded", /*rounded*/ ctx[9]);
    			}

    			if (dirty & /*cone*/ 1024) {
    				toggle_class(div, "cone", /*cone*/ ctx[10]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randomBetween(min, max) {
    	return Math.random() * (max - min) + min;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Confetti', slots, []);
    	let { size = 10 } = $$props;
    	let { x = [-0.75, 0.75] } = $$props;
    	let { y = [0.25, 1] } = $$props;
    	let { duration = 2000 } = $$props;
    	let { infinite = false } = $$props;
    	let { delay = [0, 50] } = $$props;
    	let { colorRange = [0, 360] } = $$props;
    	let { colorArray = [] } = $$props;
    	let { amount = 50 } = $$props;
    	let { iterationCount = 1 } = $$props;
    	let { fallDistance = "200px" } = $$props;
    	let { rounded = false } = $$props;
    	let { cone = false } = $$props;

    	function getColor() {
    		if (colorArray.length) return colorArray[Math.round(Math.random() * (colorArray.length - 1))]; else return `hsl(${Math.round(randomBetween(colorRange[0], colorRange[1]))}, 75%, 50%`;
    	}

    	const writable_props = [
    		'size',
    		'x',
    		'y',
    		'duration',
    		'infinite',
    		'delay',
    		'colorRange',
    		'colorArray',
    		'amount',
    		'iterationCount',
    		'fallDistance',
    		'rounded',
    		'cone'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Confetti> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('x' in $$props) $$invalidate(1, x = $$props.x);
    		if ('y' in $$props) $$invalidate(2, y = $$props.y);
    		if ('duration' in $$props) $$invalidate(3, duration = $$props.duration);
    		if ('infinite' in $$props) $$invalidate(4, infinite = $$props.infinite);
    		if ('delay' in $$props) $$invalidate(5, delay = $$props.delay);
    		if ('colorRange' in $$props) $$invalidate(12, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(13, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    	};

    	$$self.$capture_state = () => ({
    		size,
    		x,
    		y,
    		duration,
    		infinite,
    		delay,
    		colorRange,
    		colorArray,
    		amount,
    		iterationCount,
    		fallDistance,
    		rounded,
    		cone,
    		randomBetween,
    		getColor
    	});

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('x' in $$props) $$invalidate(1, x = $$props.x);
    		if ('y' in $$props) $$invalidate(2, y = $$props.y);
    		if ('duration' in $$props) $$invalidate(3, duration = $$props.duration);
    		if ('infinite' in $$props) $$invalidate(4, infinite = $$props.infinite);
    		if ('delay' in $$props) $$invalidate(5, delay = $$props.delay);
    		if ('colorRange' in $$props) $$invalidate(12, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(13, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		size,
    		x,
    		y,
    		duration,
    		infinite,
    		delay,
    		amount,
    		iterationCount,
    		fallDistance,
    		rounded,
    		cone,
    		getColor,
    		colorRange,
    		colorArray
    	];
    }

    class Confetti extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			size: 0,
    			x: 1,
    			y: 2,
    			duration: 3,
    			infinite: 4,
    			delay: 5,
    			colorRange: 12,
    			colorArray: 13,
    			amount: 6,
    			iterationCount: 7,
    			fallDistance: 8,
    			rounded: 9,
    			cone: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Confetti",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get size() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get infinite() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set infinite(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delay() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delay(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorRange() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorRange(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorArray() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorArray(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iterationCount() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iterationCount(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallDistance() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallDistance(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cone() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cone(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ToggleConfetti.svelte generated by Svelte v3.42.1 */
    const file$1 = "src\\ToggleConfetti.svelte";
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});

    // (26:2) {#if active}
    function create_if_block(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "confetti svelte-gjums2");
    			add_location(div, file$1, 26, 4, 391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(26:2) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let span;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const label_slot_template = /*#slots*/ ctx[5].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[4], get_label_slot_context);
    	let if_block = /*active*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (label_slot) label_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "svelte-gjums2");
    			toggle_class(span, "relative", /*relative*/ ctx[0]);
    			add_location(span, file$1, 22, 0, 304);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (label_slot) {
    				label_slot.m(span, null);
    			}

    			append_dev(span, t);
    			if (if_block) if_block.m(span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (label_slot) {
    				if (label_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						label_slot,
    						label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(label_slot_template, /*$$scope*/ ctx[4], dirty, get_label_slot_changes),
    						get_label_slot_context
    					);
    				}
    			}

    			if (/*active*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(span, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*relative*/ 1) {
    				toggle_class(span, "relative", /*relative*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label_slot, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label_slot, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (label_slot) label_slot.d(detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToggleConfetti', slots, ['label','default']);
    	let { toggleOnce } = $$props;
    	let { relative = true } = $$props;
    	let active = false;

    	async function click() {
    		if (toggleOnce) {
    			$$invalidate(1, active = !active);
    			return;
    		}

    		$$invalidate(1, active = false);
    		await tick();
    		$$invalidate(1, active = true);
    	}

    	const writable_props = ['toggleOnce', 'relative'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToggleConfetti> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('toggleOnce' in $$props) $$invalidate(3, toggleOnce = $$props.toggleOnce);
    		if ('relative' in $$props) $$invalidate(0, relative = $$props.relative);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		toggleOnce,
    		relative,
    		active,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ('toggleOnce' in $$props) $$invalidate(3, toggleOnce = $$props.toggleOnce);
    		if ('relative' in $$props) $$invalidate(0, relative = $$props.relative);
    		if ('active' in $$props) $$invalidate(1, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [relative, active, click, toggleOnce, $$scope, slots];
    }

    class ToggleConfetti extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { toggleOnce: 3, relative: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToggleConfetti",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*toggleOnce*/ ctx[3] === undefined && !('toggleOnce' in props)) {
    			console.warn("<ToggleConfetti> was created without expected prop 'toggleOnce'");
    		}
    	}

    	get toggleOnce() {
    		throw new Error("<ToggleConfetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleOnce(value) {
    		throw new Error("<ToggleConfetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get relative() {
    		throw new Error("<ToggleConfetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set relative(value) {
    		throw new Error("<ToggleConfetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.1 */
    const file = "src\\App.svelte";

    // (45:3) <ToggleConfetti>
    function create_default_slot_17(ctx) {
    	let confetti;
    	let current;
    	confetti = new Confetti({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(45:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (46:4) 
    function create_label_slot_17(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 45, 4, 1360);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_17.name,
    		type: "slot",
    		source: "(46:4) ",
    		ctx
    	});

    	return block;
    }

    // (53:3) <ToggleConfetti>
    function create_default_slot_16(ctx) {
    	let confetti;
    	let current;
    	confetti = new Confetti({ props: { amount: "200" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(53:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (54:4) 
    function create_label_slot_16(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Lots";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 53, 4, 1481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_16.name,
    		type: "slot",
    		source: "(54:4) ",
    		ctx
    	});

    	return block;
    }

    // (61:3) <ToggleConfetti>
    function create_default_slot_15(ctx) {
    	let confetti;
    	let current;
    	confetti = new Confetti({ props: { amount: "10" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(61:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (62:4) 
    function create_label_slot_15(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Little";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 61, 4, 1610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_15.name,
    		type: "slot",
    		source: "(62:4) ",
    		ctx
    	});

    	return block;
    }

    // (69:3) <ToggleConfetti>
    function create_default_slot_14(ctx) {
    	let confetti;
    	let current;
    	confetti = new Confetti({ props: { size: "20" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(69:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (70:4) 
    function create_label_slot_14(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Large";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 69, 4, 1740);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_14.name,
    		type: "slot",
    		source: "(70:4) ",
    		ctx
    	});

    	return block;
    }

    // (77:3) <ToggleConfetti>
    function create_default_slot_13(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { rounded: true, size: "15" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(77:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (78:4) 
    function create_label_slot_13(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Rounded";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 77, 4, 1867);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_13.name,
    		type: "slot",
    		source: "(78:4) ",
    		ctx
    	});

    	return block;
    }

    // (85:3) <ToggleConfetti>
    function create_default_slot_12(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { colorArray: ["var(--primary)"] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(85:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (86:4) 
    function create_label_slot_12(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Colored";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 85, 4, 2004);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_12.name,
    		type: "slot",
    		source: "(86:4) ",
    		ctx
    	});

    	return block;
    }

    // (93:3) <ToggleConfetti>
    function create_default_slot_11(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				colorArray: ["var(--primary)", "white", "green"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(93:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (94:4) 
    function create_label_slot_11(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Multi Colored";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 93, 4, 2157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_11.name,
    		type: "slot",
    		source: "(94:4) ",
    		ctx
    	});

    	return block;
    }

    // (101:3) <ToggleConfetti>
    function create_default_slot_10(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				size: "20",
    				colorArray: [
    					"url(https://svelte.dev/favicon.png)",
    					"url(https://github.githubassets.com/favicons/favicon-dark.png)"
    				]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(101:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (102:4) 
    function create_label_slot_10(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Images";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 101, 4, 2334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_10.name,
    		type: "slot",
    		source: "(102:4) ",
    		ctx
    	});

    	return block;
    }

    // (109:3) <ToggleConfetti>
    function create_default_slot_9(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				size: "20",
    				colorArray: ["linear-gradient(#c8102e, white, #003da5)"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(109:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (110:4) 
    function create_label_slot_9(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Gradient";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 109, 4, 2581);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_9.name,
    		type: "slot",
    		source: "(110:4) ",
    		ctx
    	});

    	return block;
    }

    // (117:3) <ToggleConfetti>
    function create_default_slot_8(ctx) {
    	let confetti0;
    	let t0;
    	let confetti1;
    	let t1;
    	let confetti2;
    	let current;

    	confetti0 = new Confetti({
    			props: {
    				y: [0.15, 1.25],
    				x: [-1.15, -0.35],
    				colorArray: ["#c8102e"]
    			},
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				y: [0.15, 1.25],
    				x: [-0.45, 0.45],
    				colorArray: ["white"]
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				y: [0.15, 1.25],
    				x: [0.35, 1.15],
    				colorArray: ["#003da5"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti0.$$.fragment);
    			t0 = space();
    			create_component(confetti1.$$.fragment);
    			t1 = space();
    			create_component(confetti2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(confetti1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(confetti2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti0.$$.fragment, local);
    			transition_in(confetti1.$$.fragment, local);
    			transition_in(confetti2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti0.$$.fragment, local);
    			transition_out(confetti1.$$.fragment, local);
    			transition_out(confetti2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(confetti1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(confetti2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(117:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (118:4) 
    function create_label_slot_8(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Flag";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 117, 4, 2769);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_8.name,
    		type: "slot",
    		source: "(118:4) ",
    		ctx
    	});

    	return block;
    }

    // (127:3) <ToggleConfetti>
    function create_default_slot_7(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { y: [1, 2], x: [-0.25, 0.25] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(127:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (128:4) 
    function create_label_slot_7(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Vertical";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 127, 4, 3101);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_7.name,
    		type: "slot",
    		source: "(128:4) ",
    		ctx
    	});

    	return block;
    }

    // (135:3) <ToggleConfetti>
    function create_default_slot_6(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { y: [0.25, 0.5], x: [-4, 4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(135:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (136:4) 
    function create_label_slot_6(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Horizontal";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 135, 4, 3252);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_6.name,
    		type: "slot",
    		source: "(136:4) ",
    		ctx
    	});

    	return block;
    }

    // (143:3) <ToggleConfetti>
    function create_default_slot_5(ctx) {
    	let confetti;
    	let current;
    	confetti = new Confetti({ props: { cone: true }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(143:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (144:4) 
    function create_label_slot_5(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 143, 4, 3404);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_5.name,
    		type: "slot",
    		source: "(144:4) ",
    		ctx
    	});

    	return block;
    }

    // (151:3) <ToggleConfetti>
    function create_default_slot_4(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { y: [-0.5, 0.5], x: [-0.5, 0.5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(151:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (152:4) 
    function create_label_slot_4(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Explosion";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 151, 4, 3527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_4.name,
    		type: "slot",
    		source: "(152:4) ",
    		ctx
    	});

    	return block;
    }

    // (159:3) <ToggleConfetti>
    function create_default_slot_3(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { delay: [0, 750] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(159:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (160:4) 
    function create_label_slot_3(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Spray";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 159, 4, 3682);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_3.name,
    		type: "slot",
    		source: "(160:4) ",
    		ctx
    	});

    	return block;
    }

    // (167:3) <ToggleConfetti>
    function create_default_slot_2(ctx) {
    	let confetti0;
    	let t0;
    	let confetti1;
    	let t1;
    	let confetti2;
    	let current;

    	confetti0 = new Confetti({
    			props: { x: [-0.5, 0.5] },
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				amount: "10",
    				x: [-1, -0.4],
    				y: [0.25, 0.75]
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				amount: "10",
    				x: [0.4, 1],
    				y: [0.25, 0.75]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti0.$$.fragment);
    			t0 = space();
    			create_component(confetti1.$$.fragment);
    			t1 = space();
    			create_component(confetti2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(confetti1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(confetti2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti0.$$.fragment, local);
    			transition_in(confetti1.$$.fragment, local);
    			transition_in(confetti2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti0.$$.fragment, local);
    			transition_out(confetti1.$$.fragment, local);
    			transition_out(confetti2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(confetti1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(confetti2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(167:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (168:4) 
    function create_label_slot_2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 167, 4, 3818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_2.name,
    		type: "slot",
    		source: "(168:4) ",
    		ctx
    	});

    	return block;
    }

    // (177:3) <ToggleConfetti toggleOnce>
    function create_default_slot_1(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				infinite: true,
    				amount: "20",
    				delay: [0, 500]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(confetti.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(177:3) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (178:4) 
    function create_label_slot_1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Constant";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 177, 4, 4086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_1.name,
    		type: "slot",
    		source: "(178:4) ",
    		ctx
    	});

    	return block;
    }

    // (186:3) <ToggleConfetti toggleOnce relative={false}>
    function create_default_slot(ctx) {
    	let div;
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				infinite: true,
    				duration: "5000",
    				amount: "200",
    				x: [-5, 5],
    				y: [0, 0.1],
    				delay: [500, 2000],
    				fallDistance: "100vh"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(confetti.$$.fragment);
    			set_style(div, "position", "fixed");
    			set_style(div, "top", "-50px");
    			set_style(div, "left", "0");
    			set_style(div, "height", "100vh");
    			set_style(div, "width", "100vw");
    			set_style(div, "display", "flex");
    			set_style(div, "justify-content", "center");
    			set_style(div, "overflow", "hidden");
    			add_location(div, file, 190, 4, 4335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(confetti, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(confetti);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(186:3) <ToggleConfetti toggleOnce relative={false}>",
    		ctx
    	});

    	return block;
    }

    // (187:4) 
    function create_label_slot(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Fullscreen";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-g7qv49");
    			add_location(button, file, 186, 4, 4274);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot.name,
    		type: "slot",
    		source: "(187:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div20;
    	let div0;
    	let h1;
    	let confetti0;
    	let t0;
    	let mark0;
    	let t2;
    	let confetti1;
    	let t3;
    	let div3;
    	let p0;
    	let t4;
    	let em;
    	let t6;
    	let t7;
    	let div1;
    	let t9;
    	let p1;
    	let a0;
    	let t11;
    	let h20;
    	let t13;
    	let p2;
    	let t15;
    	let div2;
    	let toggleconfetti0;
    	let t16;
    	let toggleconfetti1;
    	let t17;
    	let toggleconfetti2;
    	let t18;
    	let toggleconfetti3;
    	let t19;
    	let toggleconfetti4;
    	let t20;
    	let toggleconfetti5;
    	let t21;
    	let toggleconfetti6;
    	let t22;
    	let toggleconfetti7;
    	let t23;
    	let toggleconfetti8;
    	let t24;
    	let toggleconfetti9;
    	let t25;
    	let toggleconfetti10;
    	let t26;
    	let toggleconfetti11;
    	let t27;
    	let toggleconfetti12;
    	let t28;
    	let toggleconfetti13;
    	let t29;
    	let toggleconfetti14;
    	let t30;
    	let toggleconfetti15;
    	let t31;
    	let toggleconfetti16;
    	let t32;
    	let toggleconfetti17;
    	let t33;
    	let h21;
    	let t35;
    	let p3;
    	let t37;
    	let code0;
    	let t38;
    	let mark1;
    	let t40;
    	let code1;
    	let t41;
    	let mark2;
    	let t43;
    	let p4;
    	let t45;
    	let code2;
    	let t46;
    	let mark3;
    	let t48;
    	let mark4;
    	let t50;
    	let t51;
    	let code3;
    	let t52;
    	let mark5;
    	let t54;
    	let t55;
    	let div4;
    	let t56;
    	let a1;
    	let t58;
    	let h22;
    	let t60;
    	let div19;
    	let p5;
    	let t62;
    	let div18;
    	let strong0;
    	let t64;
    	let strong1;
    	let t66;
    	let strong2;
    	let t68;
    	let code4;
    	let t70;
    	let code5;
    	let t72;
    	let div5;
    	let t74;
    	let code6;
    	let t76;
    	let code7;
    	let t78;
    	let div6;
    	let t80;
    	let code8;
    	let t82;
    	let code9;
    	let t84;
    	let div7;
    	let t86;
    	let code10;
    	let t88;
    	let code11;
    	let t90;
    	let div8;
    	let t92;
    	let code12;
    	let t94;
    	let code13;
    	let t96;
    	let div9;
    	let t98;
    	let code14;
    	let t100;
    	let code15;
    	let t102;
    	let div10;
    	let t104;
    	let code16;
    	let t106;
    	let code17;
    	let t108;
    	let div11;
    	let t110;
    	let code18;
    	let t112;
    	let code19;
    	let t114;
    	let div12;
    	let t116;
    	let code20;
    	let t118;
    	let code21;
    	let t120;
    	let div13;
    	let t122;
    	let code22;
    	let t124;
    	let code23;
    	let t126;
    	let div14;
    	let t128;
    	let code24;
    	let t130;
    	let code25;
    	let t132;
    	let div15;
    	let t134;
    	let code26;
    	let t136;
    	let code27;
    	let t138;
    	let div16;
    	let t140;
    	let code28;
    	let t142;
    	let code29;
    	let t144;
    	let div17;
    	let current;

    	confetti0 = new Confetti({
    			props: {
    				infinite: true,
    				amount: "10",
    				x: [-0.5, -0.25],
    				y: [0.25, 0.5],
    				delay: [500, 2000],
    				colorArray: ["var(--primary)"]
    			},
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				infinite: true,
    				amount: "10",
    				x: [0.25, 0.5],
    				y: [0.25, 0.5],
    				delay: [500, 2000],
    				colorArray: ["white"]
    			},
    			$$inline: true
    		});

    	toggleconfetti0 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_17],
    					default: [create_default_slot_17]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti1 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_16],
    					default: [create_default_slot_16]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti2 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_15],
    					default: [create_default_slot_15]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti3 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_14],
    					default: [create_default_slot_14]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti4 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_13],
    					default: [create_default_slot_13]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti5 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_12],
    					default: [create_default_slot_12]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti6 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_11],
    					default: [create_default_slot_11]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti7 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_10],
    					default: [create_default_slot_10]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti8 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_9],
    					default: [create_default_slot_9]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti9 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_8],
    					default: [create_default_slot_8]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti10 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_7],
    					default: [create_default_slot_7]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti11 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_6],
    					default: [create_default_slot_6]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti12 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_5],
    					default: [create_default_slot_5]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti13 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_4],
    					default: [create_default_slot_4]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti14 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_3],
    					default: [create_default_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti15 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_2],
    					default: [create_default_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti16 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_1],
    					default: [create_default_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti17 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				relative: false,
    				$$slots: {
    					label: [create_label_slot],
    					default: [create_default_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div20 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			create_component(confetti0.$$.fragment);
    			t0 = space();
    			mark0 = element("mark");
    			mark0.textContent = "Svelte";
    			t2 = text(" Confetti\r\n\r\n\t\t\t");
    			create_component(confetti1.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			p0 = element("p");
    			t4 = text("Add a little bit of flair to your app with some confetti 🎊! There are no dependencies and it's tiny in size. Even better; it works without JavaScript with the help of SSR in SvelteKit ");
    			em = element("em");
    			em.textContent = "(this page doesn't use SSR though)";
    			t6 = text("!");
    			t7 = space();
    			div1 = element("div");
    			div1.textContent = "It looks like you have enabled reduced motion. That's cool, but just be aware that the demos on this page will not work.";
    			t9 = space();
    			p1 = element("p");
    			a0 = element("a");
    			a0.textContent = "GitHub";
    			t11 = space();
    			h20 = element("h2");
    			h20.textContent = "Demo";
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "Click these buttons to see their effect. Most of these are not just a single toggle, they are a combination of multiple props. Don't worry we'll go over each one in the documentation further down the page!";
    			t15 = space();
    			div2 = element("div");
    			create_component(toggleconfetti0.$$.fragment);
    			t16 = space();
    			create_component(toggleconfetti1.$$.fragment);
    			t17 = space();
    			create_component(toggleconfetti2.$$.fragment);
    			t18 = space();
    			create_component(toggleconfetti3.$$.fragment);
    			t19 = space();
    			create_component(toggleconfetti4.$$.fragment);
    			t20 = space();
    			create_component(toggleconfetti5.$$.fragment);
    			t21 = space();
    			create_component(toggleconfetti6.$$.fragment);
    			t22 = space();
    			create_component(toggleconfetti7.$$.fragment);
    			t23 = space();
    			create_component(toggleconfetti8.$$.fragment);
    			t24 = space();
    			create_component(toggleconfetti9.$$.fragment);
    			t25 = space();
    			create_component(toggleconfetti10.$$.fragment);
    			t26 = space();
    			create_component(toggleconfetti11.$$.fragment);
    			t27 = space();
    			create_component(toggleconfetti12.$$.fragment);
    			t28 = space();
    			create_component(toggleconfetti13.$$.fragment);
    			t29 = space();
    			create_component(toggleconfetti14.$$.fragment);
    			t30 = space();
    			create_component(toggleconfetti15.$$.fragment);
    			t31 = space();
    			create_component(toggleconfetti16.$$.fragment);
    			t32 = space();
    			create_component(toggleconfetti17.$$.fragment);
    			t33 = space();
    			h21 = element("h2");
    			h21.textContent = "Installation";
    			t35 = space();
    			p3 = element("p");
    			p3.textContent = "Install using Yarn or NPM.";
    			t37 = space();
    			code0 = element("code");
    			t38 = text("yarn add ");
    			mark1 = element("mark");
    			mark1.textContent = "svelte-confetti";
    			t40 = space();
    			code1 = element("code");
    			t41 = text("npm install --save ");
    			mark2 = element("mark");
    			mark2.textContent = "svelte-confetti";
    			t43 = space();
    			p4 = element("p");
    			p4.textContent = "Include the component in your app.";
    			t45 = space();
    			code2 = element("code");
    			t46 = text("import { ");
    			mark3 = element("mark");
    			mark3.textContent = "Confetti";
    			t48 = text(" } from \"");
    			mark4 = element("mark");
    			mark4.textContent = "svelte-confetti";
    			t50 = text("\"");
    			t51 = space();
    			code3 = element("code");
    			t52 = text("<");
    			mark5 = element("mark");
    			mark5.textContent = "Confetti";
    			t54 = text(" />");
    			t55 = space();
    			div4 = element("div");
    			t56 = text("Made by ");
    			a1 = element("a");
    			a1.textContent = "Mitchel Jager";
    			t58 = space();
    			h22 = element("h2");
    			h22.textContent = "Properties";
    			t60 = space();
    			div19 = element("div");
    			p5 = element("p");
    			p5.textContent = "This is a list of all configurable properties.";
    			t62 = space();
    			div18 = element("div");
    			strong0 = element("strong");
    			strong0.textContent = "Property";
    			t64 = space();
    			strong1 = element("strong");
    			strong1.textContent = "Default";
    			t66 = space();
    			strong2 = element("strong");
    			strong2.textContent = "Description";
    			t68 = space();
    			code4 = element("code");
    			code4.textContent = "size";
    			t70 = space();
    			code5 = element("code");
    			code5.textContent = "10";
    			t72 = space();
    			div5 = element("div");
    			div5.textContent = "The max size in pixels of the individual confetti pieces.";
    			t74 = space();
    			code6 = element("code");
    			code6.textContent = "x";
    			t76 = space();
    			code7 = element("code");
    			code7.textContent = "[-0.75, 0.75]";
    			t78 = space();
    			div6 = element("div");
    			div6.textContent = "The max horizontal range of the confetti pieces. Negative is left, positive is right. [-1, 1] would mean maximum of 200px left and 200px right.";
    			t80 = space();
    			code8 = element("code");
    			code8.textContent = "y";
    			t82 = space();
    			code9 = element("code");
    			code9.textContent = "[0.25, 1]";
    			t84 = space();
    			div7 = element("div");
    			div7.textContent = "The max vertical range of the confetti pieces. Negative is down, positive is ip. [-1, 1] would mean maximum of 200px down and 200px up.";
    			t86 = space();
    			code10 = element("code");
    			code10.textContent = "duration";
    			t88 = space();
    			code11 = element("code");
    			code11.textContent = "2000";
    			t90 = space();
    			div8 = element("div");
    			div8.textContent = "Duration of the animation for each individual piece.";
    			t92 = space();
    			code12 = element("code");
    			code12.textContent = "infinite";
    			t94 = space();
    			code13 = element("code");
    			code13.textContent = "false";
    			t96 = space();
    			div9 = element("div");
    			div9.textContent = "If set to true the animation will play indefinitely.";
    			t98 = space();
    			code14 = element("code");
    			code14.textContent = "delay";
    			t100 = space();
    			code15 = element("code");
    			code15.textContent = "[0, 50]";
    			t102 = space();
    			div10 = element("div");
    			div10.textContent = "Used to set a random delay for each piece. A large difference between each number will mean a longer spray time.";
    			t104 = space();
    			code16 = element("code");
    			code16.textContent = "colorRange";
    			t106 = space();
    			code17 = element("code");
    			code17.textContent = "[0, 360]";
    			t108 = space();
    			div11 = element("div");
    			div11.textContent = "Color range on the HSL color wheel. 0 to 360 is full RGB. 75 To 150 would be only green colors.";
    			t110 = space();
    			code18 = element("code");
    			code18.textContent = "colorArray";
    			t112 = space();
    			code19 = element("code");
    			code19.textContent = "[]";
    			t114 = space();
    			div12 = element("div");
    			div12.textContent = "Can be used to pick a random color from this array. Set just one array elements to have a single color. Accepts any viable css background property, including gradients and images.";
    			t116 = space();
    			code20 = element("code");
    			code20.textContent = "amount";
    			t118 = space();
    			code21 = element("code");
    			code21.textContent = "50";
    			t120 = space();
    			div13 = element("div");
    			div13.textContent = "Amount of particles spawned. The larger your spray the more pieces you might want. Be careful with too many as it might impact performance.";
    			t122 = space();
    			code22 = element("code");
    			code22.textContent = "iterationCount";
    			t124 = space();
    			code23 = element("code");
    			code23.textContent = "1";
    			t126 = space();
    			div14 = element("div");
    			div14.textContent = "How many times the animation will play before stopping. Is overwritten by the \"infinite\" property.";
    			t128 = space();
    			code24 = element("code");
    			code24.textContent = "fallDistance";
    			t130 = space();
    			code25 = element("code");
    			code25.textContent = "\"200px\"";
    			t132 = space();
    			div15 = element("div");
    			div15.textContent = "How far each piece falls. Accepts any css property, px, rem, vh, etc.";
    			t134 = space();
    			code26 = element("code");
    			code26.textContent = "rounded";
    			t136 = space();
    			code27 = element("code");
    			code27.textContent = "false";
    			t138 = space();
    			div16 = element("div");
    			div16.textContent = "Set to true to make each confetti piece rounded.";
    			t140 = space();
    			code28 = element("code");
    			code28.textContent = "cone";
    			t142 = space();
    			code29 = element("code");
    			code29.textContent = "false";
    			t144 = space();
    			div17 = element("div");
    			div17.textContent = "Set to true to make the explosion appear in a cone like shape which might feel more realistic when dealing with a larger amount.";
    			attr_dev(mark0, "class", "svelte-g7qv49");
    			add_location(mark0, file, 18, 3, 340);
    			attr_dev(h1, "class", "svelte-g7qv49");
    			add_location(h1, file, 9, 2, 175);
    			attr_dev(div0, "class", "header svelte-g7qv49");
    			add_location(div0, file, 8, 1, 151);
    			add_location(em, file, 31, 190, 766);
    			attr_dev(p0, "class", "svelte-g7qv49");
    			add_location(p0, file, 31, 2, 578);
    			attr_dev(div1, "class", "reduced-motion-only svelte-g7qv49");
    			add_location(div1, file, 33, 2, 820);
    			attr_dev(a0, "href", "https://github.com/Mitcheljager/svelte-confetti");
    			attr_dev(a0, "class", "svelte-g7qv49");
    			add_location(a0, file, 37, 5, 997);
    			attr_dev(p1, "class", "svelte-g7qv49");
    			add_location(p1, file, 37, 2, 994);
    			attr_dev(h20, "class", "svelte-g7qv49");
    			add_location(h20, file, 39, 2, 1075);
    			attr_dev(p2, "class", "svelte-g7qv49");
    			add_location(p2, file, 41, 2, 1094);
    			attr_dev(div2, "class", "buttons svelte-g7qv49");
    			add_location(div2, file, 43, 2, 1312);
    			attr_dev(h21, "class", "svelte-g7qv49");
    			add_location(h21, file, 196, 2, 4642);
    			attr_dev(p3, "class", "svelte-g7qv49");
    			add_location(p3, file, 198, 2, 4669);
    			attr_dev(mark1, "class", "svelte-g7qv49");
    			add_location(mark1, file, 201, 12, 4741);
    			attr_dev(code0, "class", "well svelte-g7qv49");
    			add_location(code0, file, 200, 2, 4708);
    			attr_dev(mark2, "class", "svelte-g7qv49");
    			add_location(mark2, file, 205, 22, 4829);
    			attr_dev(code1, "class", "well svelte-g7qv49");
    			add_location(code1, file, 204, 2, 4786);
    			attr_dev(p4, "class", "svelte-g7qv49");
    			add_location(p4, file, 208, 2, 4874);
    			attr_dev(mark3, "class", "svelte-g7qv49");
    			add_location(mark3, file, 211, 17, 4959);
    			attr_dev(mark4, "class", "svelte-g7qv49");
    			add_location(mark4, file, 211, 52, 4994);
    			attr_dev(code2, "class", "well svelte-g7qv49");
    			add_location(code2, file, 210, 2, 4921);
    			attr_dev(mark5, "class", "svelte-g7qv49");
    			add_location(mark5, file, 215, 7, 5068);
    			attr_dev(code3, "class", "well svelte-g7qv49");
    			add_location(code3, file, 214, 2, 5040);
    			attr_dev(div3, "class", "block block--single svelte-g7qv49");
    			add_location(div3, file, 30, 1, 541);
    			attr_dev(a1, "href", "https://github.com/Mitcheljager");
    			attr_dev(a1, "class", "svelte-g7qv49");
    			add_location(a1, file, 220, 10, 5165);
    			attr_dev(div4, "class", "block block--single svelte-g7qv49");
    			add_location(div4, file, 219, 1, 5120);
    			attr_dev(h22, "class", "svelte-g7qv49");
    			add_location(h22, file, 223, 1, 5238);
    			attr_dev(p5, "class", "svelte-g7qv49");
    			add_location(p5, file, 226, 2, 5299);
    			attr_dev(strong0, "class", "svelte-g7qv49");
    			add_location(strong0, file, 229, 3, 5382);
    			attr_dev(strong1, "class", "svelte-g7qv49");
    			add_location(strong1, file, 229, 29, 5408);
    			attr_dev(strong2, "class", "svelte-g7qv49");
    			add_location(strong2, file, 229, 54, 5433);
    			attr_dev(code4, "class", "svelte-g7qv49");
    			add_location(code4, file, 231, 3, 5468);
    			attr_dev(code5, "class", "svelte-g7qv49");
    			add_location(code5, file, 231, 21, 5486);
    			add_location(div5, file, 231, 37, 5502);
    			attr_dev(code6, "class", "svelte-g7qv49");
    			add_location(code6, file, 232, 3, 5575);
    			attr_dev(code7, "class", "svelte-g7qv49");
    			add_location(code7, file, 232, 18, 5590);
    			add_location(div6, file, 232, 45, 5617);
    			attr_dev(code8, "class", "svelte-g7qv49");
    			add_location(code8, file, 233, 3, 5776);
    			attr_dev(code9, "class", "svelte-g7qv49");
    			add_location(code9, file, 233, 18, 5791);
    			add_location(div7, file, 233, 41, 5814);
    			attr_dev(code10, "class", "svelte-g7qv49");
    			add_location(code10, file, 234, 3, 5965);
    			attr_dev(code11, "class", "svelte-g7qv49");
    			add_location(code11, file, 234, 25, 5987);
    			add_location(div8, file, 234, 43, 6005);
    			attr_dev(code12, "class", "svelte-g7qv49");
    			add_location(code12, file, 235, 3, 6073);
    			attr_dev(code13, "class", "svelte-g7qv49");
    			add_location(code13, file, 235, 25, 6095);
    			add_location(div9, file, 235, 44, 6114);
    			attr_dev(code14, "class", "svelte-g7qv49");
    			add_location(code14, file, 236, 3, 6182);
    			attr_dev(code15, "class", "svelte-g7qv49");
    			add_location(code15, file, 236, 22, 6201);
    			add_location(div10, file, 236, 43, 6222);
    			attr_dev(code16, "class", "svelte-g7qv49");
    			add_location(code16, file, 237, 3, 6350);
    			attr_dev(code17, "class", "svelte-g7qv49");
    			add_location(code17, file, 237, 27, 6374);
    			add_location(div11, file, 237, 49, 6396);
    			attr_dev(code18, "class", "svelte-g7qv49");
    			add_location(code18, file, 238, 3, 6507);
    			attr_dev(code19, "class", "svelte-g7qv49");
    			add_location(code19, file, 238, 27, 6531);
    			add_location(div12, file, 238, 43, 6547);
    			attr_dev(code20, "class", "svelte-g7qv49");
    			add_location(code20, file, 239, 3, 6742);
    			attr_dev(code21, "class", "svelte-g7qv49");
    			add_location(code21, file, 239, 23, 6762);
    			add_location(div13, file, 239, 39, 6778);
    			attr_dev(code22, "class", "svelte-g7qv49");
    			add_location(code22, file, 240, 3, 6933);
    			attr_dev(code23, "class", "svelte-g7qv49");
    			add_location(code23, file, 240, 31, 6961);
    			add_location(div14, file, 240, 46, 6976);
    			attr_dev(code24, "class", "svelte-g7qv49");
    			add_location(code24, file, 241, 3, 7090);
    			attr_dev(code25, "class", "svelte-g7qv49");
    			add_location(code25, file, 241, 29, 7116);
    			add_location(div15, file, 241, 50, 7137);
    			attr_dev(code26, "class", "svelte-g7qv49");
    			add_location(code26, file, 242, 3, 7222);
    			attr_dev(code27, "class", "svelte-g7qv49");
    			add_location(code27, file, 242, 24, 7243);
    			add_location(div16, file, 242, 43, 7262);
    			attr_dev(code28, "class", "svelte-g7qv49");
    			add_location(code28, file, 243, 3, 7326);
    			attr_dev(code29, "class", "svelte-g7qv49");
    			add_location(code29, file, 243, 21, 7344);
    			add_location(div17, file, 243, 40, 7363);
    			attr_dev(div18, "class", "table svelte-g7qv49");
    			add_location(div18, file, 228, 2, 5358);
    			attr_dev(div19, "class", "block block--single svelte-g7qv49");
    			add_location(div19, file, 225, 1, 5262);
    			attr_dev(div20, "class", "wrapper svelte-g7qv49");
    			add_location(div20, file, 7, 0, 127);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div20, anchor);
    			append_dev(div20, div0);
    			append_dev(div0, h1);
    			mount_component(confetti0, h1, null);
    			append_dev(h1, t0);
    			append_dev(h1, mark0);
    			append_dev(h1, t2);
    			mount_component(confetti1, h1, null);
    			append_dev(div20, t3);
    			append_dev(div20, div3);
    			append_dev(div3, p0);
    			append_dev(p0, t4);
    			append_dev(p0, em);
    			append_dev(p0, t6);
    			append_dev(div3, t7);
    			append_dev(div3, div1);
    			append_dev(div3, t9);
    			append_dev(div3, p1);
    			append_dev(p1, a0);
    			append_dev(div3, t11);
    			append_dev(div3, h20);
    			append_dev(div3, t13);
    			append_dev(div3, p2);
    			append_dev(div3, t15);
    			append_dev(div3, div2);
    			mount_component(toggleconfetti0, div2, null);
    			append_dev(div2, t16);
    			mount_component(toggleconfetti1, div2, null);
    			append_dev(div2, t17);
    			mount_component(toggleconfetti2, div2, null);
    			append_dev(div2, t18);
    			mount_component(toggleconfetti3, div2, null);
    			append_dev(div2, t19);
    			mount_component(toggleconfetti4, div2, null);
    			append_dev(div2, t20);
    			mount_component(toggleconfetti5, div2, null);
    			append_dev(div2, t21);
    			mount_component(toggleconfetti6, div2, null);
    			append_dev(div2, t22);
    			mount_component(toggleconfetti7, div2, null);
    			append_dev(div2, t23);
    			mount_component(toggleconfetti8, div2, null);
    			append_dev(div2, t24);
    			mount_component(toggleconfetti9, div2, null);
    			append_dev(div2, t25);
    			mount_component(toggleconfetti10, div2, null);
    			append_dev(div2, t26);
    			mount_component(toggleconfetti11, div2, null);
    			append_dev(div2, t27);
    			mount_component(toggleconfetti12, div2, null);
    			append_dev(div2, t28);
    			mount_component(toggleconfetti13, div2, null);
    			append_dev(div2, t29);
    			mount_component(toggleconfetti14, div2, null);
    			append_dev(div2, t30);
    			mount_component(toggleconfetti15, div2, null);
    			append_dev(div2, t31);
    			mount_component(toggleconfetti16, div2, null);
    			append_dev(div2, t32);
    			mount_component(toggleconfetti17, div2, null);
    			append_dev(div3, t33);
    			append_dev(div3, h21);
    			append_dev(div3, t35);
    			append_dev(div3, p3);
    			append_dev(div3, t37);
    			append_dev(div3, code0);
    			append_dev(code0, t38);
    			append_dev(code0, mark1);
    			append_dev(div3, t40);
    			append_dev(div3, code1);
    			append_dev(code1, t41);
    			append_dev(code1, mark2);
    			append_dev(div3, t43);
    			append_dev(div3, p4);
    			append_dev(div3, t45);
    			append_dev(div3, code2);
    			append_dev(code2, t46);
    			append_dev(code2, mark3);
    			append_dev(code2, t48);
    			append_dev(code2, mark4);
    			append_dev(code2, t50);
    			append_dev(div3, t51);
    			append_dev(div3, code3);
    			append_dev(code3, t52);
    			append_dev(code3, mark5);
    			append_dev(code3, t54);
    			append_dev(div20, t55);
    			append_dev(div20, div4);
    			append_dev(div4, t56);
    			append_dev(div4, a1);
    			append_dev(div20, t58);
    			append_dev(div20, h22);
    			append_dev(div20, t60);
    			append_dev(div20, div19);
    			append_dev(div19, p5);
    			append_dev(div19, t62);
    			append_dev(div19, div18);
    			append_dev(div18, strong0);
    			append_dev(div18, t64);
    			append_dev(div18, strong1);
    			append_dev(div18, t66);
    			append_dev(div18, strong2);
    			append_dev(div18, t68);
    			append_dev(div18, code4);
    			append_dev(div18, t70);
    			append_dev(div18, code5);
    			append_dev(div18, t72);
    			append_dev(div18, div5);
    			append_dev(div18, t74);
    			append_dev(div18, code6);
    			append_dev(div18, t76);
    			append_dev(div18, code7);
    			append_dev(div18, t78);
    			append_dev(div18, div6);
    			append_dev(div18, t80);
    			append_dev(div18, code8);
    			append_dev(div18, t82);
    			append_dev(div18, code9);
    			append_dev(div18, t84);
    			append_dev(div18, div7);
    			append_dev(div18, t86);
    			append_dev(div18, code10);
    			append_dev(div18, t88);
    			append_dev(div18, code11);
    			append_dev(div18, t90);
    			append_dev(div18, div8);
    			append_dev(div18, t92);
    			append_dev(div18, code12);
    			append_dev(div18, t94);
    			append_dev(div18, code13);
    			append_dev(div18, t96);
    			append_dev(div18, div9);
    			append_dev(div18, t98);
    			append_dev(div18, code14);
    			append_dev(div18, t100);
    			append_dev(div18, code15);
    			append_dev(div18, t102);
    			append_dev(div18, div10);
    			append_dev(div18, t104);
    			append_dev(div18, code16);
    			append_dev(div18, t106);
    			append_dev(div18, code17);
    			append_dev(div18, t108);
    			append_dev(div18, div11);
    			append_dev(div18, t110);
    			append_dev(div18, code18);
    			append_dev(div18, t112);
    			append_dev(div18, code19);
    			append_dev(div18, t114);
    			append_dev(div18, div12);
    			append_dev(div18, t116);
    			append_dev(div18, code20);
    			append_dev(div18, t118);
    			append_dev(div18, code21);
    			append_dev(div18, t120);
    			append_dev(div18, div13);
    			append_dev(div18, t122);
    			append_dev(div18, code22);
    			append_dev(div18, t124);
    			append_dev(div18, code23);
    			append_dev(div18, t126);
    			append_dev(div18, div14);
    			append_dev(div18, t128);
    			append_dev(div18, code24);
    			append_dev(div18, t130);
    			append_dev(div18, code25);
    			append_dev(div18, t132);
    			append_dev(div18, div15);
    			append_dev(div18, t134);
    			append_dev(div18, code26);
    			append_dev(div18, t136);
    			append_dev(div18, code27);
    			append_dev(div18, t138);
    			append_dev(div18, div16);
    			append_dev(div18, t140);
    			append_dev(div18, code28);
    			append_dev(div18, t142);
    			append_dev(div18, code29);
    			append_dev(div18, t144);
    			append_dev(div18, div17);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const toggleconfetti0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti0_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti0.$set(toggleconfetti0_changes);
    			const toggleconfetti1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti1_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti1.$set(toggleconfetti1_changes);
    			const toggleconfetti2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti2_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti2.$set(toggleconfetti2_changes);
    			const toggleconfetti3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti3_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti3.$set(toggleconfetti3_changes);
    			const toggleconfetti4_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti4_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti4.$set(toggleconfetti4_changes);
    			const toggleconfetti5_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti5_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti5.$set(toggleconfetti5_changes);
    			const toggleconfetti6_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti6_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti6.$set(toggleconfetti6_changes);
    			const toggleconfetti7_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti7_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti7.$set(toggleconfetti7_changes);
    			const toggleconfetti8_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti8_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti8.$set(toggleconfetti8_changes);
    			const toggleconfetti9_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti9_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti9.$set(toggleconfetti9_changes);
    			const toggleconfetti10_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti10_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti10.$set(toggleconfetti10_changes);
    			const toggleconfetti11_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti11_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti11.$set(toggleconfetti11_changes);
    			const toggleconfetti12_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti12_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti12.$set(toggleconfetti12_changes);
    			const toggleconfetti13_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti13_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti13.$set(toggleconfetti13_changes);
    			const toggleconfetti14_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti14_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti14.$set(toggleconfetti14_changes);
    			const toggleconfetti15_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti15_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti15.$set(toggleconfetti15_changes);
    			const toggleconfetti16_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti16_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti16.$set(toggleconfetti16_changes);
    			const toggleconfetti17_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti17_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti17.$set(toggleconfetti17_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti0.$$.fragment, local);
    			transition_in(confetti1.$$.fragment, local);
    			transition_in(toggleconfetti0.$$.fragment, local);
    			transition_in(toggleconfetti1.$$.fragment, local);
    			transition_in(toggleconfetti2.$$.fragment, local);
    			transition_in(toggleconfetti3.$$.fragment, local);
    			transition_in(toggleconfetti4.$$.fragment, local);
    			transition_in(toggleconfetti5.$$.fragment, local);
    			transition_in(toggleconfetti6.$$.fragment, local);
    			transition_in(toggleconfetti7.$$.fragment, local);
    			transition_in(toggleconfetti8.$$.fragment, local);
    			transition_in(toggleconfetti9.$$.fragment, local);
    			transition_in(toggleconfetti10.$$.fragment, local);
    			transition_in(toggleconfetti11.$$.fragment, local);
    			transition_in(toggleconfetti12.$$.fragment, local);
    			transition_in(toggleconfetti13.$$.fragment, local);
    			transition_in(toggleconfetti14.$$.fragment, local);
    			transition_in(toggleconfetti15.$$.fragment, local);
    			transition_in(toggleconfetti16.$$.fragment, local);
    			transition_in(toggleconfetti17.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti0.$$.fragment, local);
    			transition_out(confetti1.$$.fragment, local);
    			transition_out(toggleconfetti0.$$.fragment, local);
    			transition_out(toggleconfetti1.$$.fragment, local);
    			transition_out(toggleconfetti2.$$.fragment, local);
    			transition_out(toggleconfetti3.$$.fragment, local);
    			transition_out(toggleconfetti4.$$.fragment, local);
    			transition_out(toggleconfetti5.$$.fragment, local);
    			transition_out(toggleconfetti6.$$.fragment, local);
    			transition_out(toggleconfetti7.$$.fragment, local);
    			transition_out(toggleconfetti8.$$.fragment, local);
    			transition_out(toggleconfetti9.$$.fragment, local);
    			transition_out(toggleconfetti10.$$.fragment, local);
    			transition_out(toggleconfetti11.$$.fragment, local);
    			transition_out(toggleconfetti12.$$.fragment, local);
    			transition_out(toggleconfetti13.$$.fragment, local);
    			transition_out(toggleconfetti14.$$.fragment, local);
    			transition_out(toggleconfetti15.$$.fragment, local);
    			transition_out(toggleconfetti16.$$.fragment, local);
    			transition_out(toggleconfetti17.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div20);
    			destroy_component(confetti0);
    			destroy_component(confetti1);
    			destroy_component(toggleconfetti0);
    			destroy_component(toggleconfetti1);
    			destroy_component(toggleconfetti2);
    			destroy_component(toggleconfetti3);
    			destroy_component(toggleconfetti4);
    			destroy_component(toggleconfetti5);
    			destroy_component(toggleconfetti6);
    			destroy_component(toggleconfetti7);
    			destroy_component(toggleconfetti8);
    			destroy_component(toggleconfetti9);
    			destroy_component(toggleconfetti10);
    			destroy_component(toggleconfetti11);
    			destroy_component(toggleconfetti12);
    			destroy_component(toggleconfetti13);
    			destroy_component(toggleconfetti14);
    			destroy_component(toggleconfetti15);
    			destroy_component(toggleconfetti16);
    			destroy_component(toggleconfetti17);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Confetti, ToggleConfetti });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
