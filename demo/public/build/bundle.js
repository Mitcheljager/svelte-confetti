
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
    			attr_dev(div, "class", "confetti svelte-1usqfhd");
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

    			add_location(div, file$2, 29, 4, 828);
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

    			attr_dev(div, "class", "confetti-holder svelte-1usqfhd");
    			toggle_class(div, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(div, "cone", /*cone*/ ctx[10]);
    			add_location(div, file$2, 27, 0, 733);
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
    	let { x = [-0.5, 0.5] } = $$props;
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
    function create_default_slot_35(ctx) {
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
    		id: create_default_slot_35.name,
    		type: "slot",
    		source: "(45:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (46:4) 
    function create_label_slot_35(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
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
    		id: create_label_slot_35.name,
    		type: "slot",
    		source: "(46:4) ",
    		ctx
    	});

    	return block;
    }

    // (53:3) <ToggleConfetti>
    function create_default_slot_34(ctx) {
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
    		id: create_default_slot_34.name,
    		type: "slot",
    		source: "(53:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (54:4) 
    function create_label_slot_34(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Lots";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
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
    		id: create_label_slot_34.name,
    		type: "slot",
    		source: "(54:4) ",
    		ctx
    	});

    	return block;
    }

    // (61:3) <ToggleConfetti>
    function create_default_slot_33(ctx) {
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
    		id: create_default_slot_33.name,
    		type: "slot",
    		source: "(61:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (62:4) 
    function create_label_slot_33(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Few";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
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
    		id: create_label_slot_33.name,
    		type: "slot",
    		source: "(62:4) ",
    		ctx
    	});

    	return block;
    }

    // (69:3) <ToggleConfetti>
    function create_default_slot_32(ctx) {
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
    		id: create_default_slot_32.name,
    		type: "slot",
    		source: "(69:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (70:4) 
    function create_label_slot_32(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Large";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 69, 4, 1737);
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
    		id: create_label_slot_32.name,
    		type: "slot",
    		source: "(70:4) ",
    		ctx
    	});

    	return block;
    }

    // (77:3) <ToggleConfetti>
    function create_default_slot_31(ctx) {
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
    		id: create_default_slot_31.name,
    		type: "slot",
    		source: "(77:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (78:4) 
    function create_label_slot_31(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Rounded";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 77, 4, 1864);
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
    		id: create_label_slot_31.name,
    		type: "slot",
    		source: "(78:4) ",
    		ctx
    	});

    	return block;
    }

    // (85:3) <ToggleConfetti>
    function create_default_slot_30(ctx) {
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
    		id: create_default_slot_30.name,
    		type: "slot",
    		source: "(85:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (86:4) 
    function create_label_slot_30(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Colored";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 85, 4, 2001);
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
    		id: create_label_slot_30.name,
    		type: "slot",
    		source: "(86:4) ",
    		ctx
    	});

    	return block;
    }

    // (93:3) <ToggleConfetti>
    function create_default_slot_29(ctx) {
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
    		id: create_default_slot_29.name,
    		type: "slot",
    		source: "(93:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (94:4) 
    function create_label_slot_29(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Multi Colored";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 93, 4, 2154);
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
    		id: create_label_slot_29.name,
    		type: "slot",
    		source: "(94:4) ",
    		ctx
    	});

    	return block;
    }

    // (101:3) <ToggleConfetti>
    function create_default_slot_28(ctx) {
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
    		id: create_default_slot_28.name,
    		type: "slot",
    		source: "(101:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (102:4) 
    function create_label_slot_28(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Images";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 101, 4, 2331);
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
    		id: create_label_slot_28.name,
    		type: "slot",
    		source: "(102:4) ",
    		ctx
    	});

    	return block;
    }

    // (109:3) <ToggleConfetti>
    function create_default_slot_27(ctx) {
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
    		id: create_default_slot_27.name,
    		type: "slot",
    		source: "(109:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (110:4) 
    function create_label_slot_27(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Gradient";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 109, 4, 2578);
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
    		id: create_label_slot_27.name,
    		type: "slot",
    		source: "(110:4) ",
    		ctx
    	});

    	return block;
    }

    // (117:3) <ToggleConfetti>
    function create_default_slot_26(ctx) {
    	let confetti0;
    	let t0;
    	let confetti1;
    	let t1;
    	let confetti2;
    	let current;

    	confetti0 = new Confetti({
    			props: {
    				y: [1.25, 1.5],
    				x: [-1, 1],
    				colorArray: ["#c8102e"]
    			},
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				y: [1, 1.25],
    				x: [-1, 1],
    				colorArray: ["white"]
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				y: [0.75, 1],
    				x: [-1, 1],
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
    		id: create_default_slot_26.name,
    		type: "slot",
    		source: "(117:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (118:4) 
    function create_label_slot_26(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Flag";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 117, 4, 2766);
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
    		id: create_label_slot_26.name,
    		type: "slot",
    		source: "(118:4) ",
    		ctx
    	});

    	return block;
    }

    // (127:3) <ToggleConfetti>
    function create_default_slot_25(ctx) {
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
    		id: create_default_slot_25.name,
    		type: "slot",
    		source: "(127:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (128:4) 
    function create_label_slot_25(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Vertical";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 127, 4, 3073);
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
    		id: create_label_slot_25.name,
    		type: "slot",
    		source: "(128:4) ",
    		ctx
    	});

    	return block;
    }

    // (135:3) <ToggleConfetti>
    function create_default_slot_24(ctx) {
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
    		id: create_default_slot_24.name,
    		type: "slot",
    		source: "(135:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (136:4) 
    function create_label_slot_24(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Horizontal";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 135, 4, 3224);
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
    		id: create_label_slot_24.name,
    		type: "slot",
    		source: "(136:4) ",
    		ctx
    	});

    	return block;
    }

    // (143:3) <ToggleConfetti>
    function create_default_slot_23(ctx) {
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
    		id: create_default_slot_23.name,
    		type: "slot",
    		source: "(143:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (144:4) 
    function create_label_slot_23(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 143, 4, 3376);
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
    		id: create_label_slot_23.name,
    		type: "slot",
    		source: "(144:4) ",
    		ctx
    	});

    	return block;
    }

    // (151:3) <ToggleConfetti>
    function create_default_slot_22(ctx) {
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
    		id: create_default_slot_22.name,
    		type: "slot",
    		source: "(151:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (152:4) 
    function create_label_slot_22(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Explosion";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 151, 4, 3499);
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
    		id: create_label_slot_22.name,
    		type: "slot",
    		source: "(152:4) ",
    		ctx
    	});

    	return block;
    }

    // (159:3) <ToggleConfetti>
    function create_default_slot_21(ctx) {
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
    		id: create_default_slot_21.name,
    		type: "slot",
    		source: "(159:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (160:4) 
    function create_label_slot_21(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Spray";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 159, 4, 3654);
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
    		id: create_label_slot_21.name,
    		type: "slot",
    		source: "(160:4) ",
    		ctx
    	});

    	return block;
    }

    // (167:3) <ToggleConfetti>
    function create_default_slot_20(ctx) {
    	let confetti0;
    	let t0;
    	let confetti1;
    	let t1;
    	let confetti2;
    	let current;

    	confetti0 = new Confetti({
    			props: { cone: true, x: [-0.5, 0.5] },
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				cone: true,
    				amount: "10",
    				x: [-1, -0.4],
    				y: [0.25, 0.75]
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				cone: true,
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
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(167:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (168:4) 
    function create_label_slot_20(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 167, 4, 3790);
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
    		id: create_label_slot_20.name,
    		type: "slot",
    		source: "(168:4) ",
    		ctx
    	});

    	return block;
    }

    // (177:3) <ToggleConfetti toggleOnce>
    function create_default_slot_19(ctx) {
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
    		id: create_default_slot_19.name,
    		type: "slot",
    		source: "(177:3) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (178:4) 
    function create_label_slot_19(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Constant";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 177, 4, 4073);
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
    		id: create_label_slot_19.name,
    		type: "slot",
    		source: "(178:4) ",
    		ctx
    	});

    	return block;
    }

    // (186:3) <ToggleConfetti toggleOnce relative={false}>
    function create_default_slot_18(ctx) {
    	let div;
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				x: [-5, 5],
    				y: [0, 0.1],
    				delay: [500, 2000],
    				infinite: true,
    				duration: "5000",
    				amount: "200",
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
    			add_location(div, file, 190, 4, 4322);
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
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(186:3) <ToggleConfetti toggleOnce relative={false}>",
    		ctx
    	});

    	return block;
    }

    // (187:4) 
    function create_label_slot_18(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Fullscreen";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 186, 4, 4261);
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
    		id: create_label_slot_18.name,
    		type: "slot",
    		source: "(187:4) ",
    		ctx
    	});

    	return block;
    }

    // (237:2) <ToggleConfetti>
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
    		source: "(237:2) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (238:3) 
    function create_label_slot_17(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Show";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 237, 3, 5574);
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
    		source: "(238:3) ",
    		ctx
    	});

    	return block;
    }

    // (253:4) <ToggleConfetti>
    function create_default_slot_16(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { x: [-0.5, 0.5], y: [0.25, 1] },
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
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(253:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (254:5) 
    function create_label_slot_16(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 253, 5, 6231);
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
    		source: "(254:5) ",
    		ctx
    	});

    	return block;
    }

    // (267:4) <ToggleConfetti>
    function create_default_slot_15(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { x: [-1, -0.25], y: [0, 0.5] },
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
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(267:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (268:5) 
    function create_label_slot_15(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Left";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 267, 5, 6553);
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
    		source: "(268:5) ",
    		ctx
    	});

    	return block;
    }

    // (281:4) <ToggleConfetti>
    function create_default_slot_14(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { x: [0.25, 1], y: [0, 0.5] },
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
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(281:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (282:5) 
    function create_label_slot_14(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Right";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 281, 5, 6870);
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
    		source: "(282:5) ",
    		ctx
    	});

    	return block;
    }

    // (295:4) <ToggleConfetti>
    function create_default_slot_13(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { x: [-0.25, 0.25], y: [0.75, 1.5] },
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
    		source: "(295:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (296:5) 
    function create_label_slot_13(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Up";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 295, 5, 7184);
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
    		source: "(296:5) ",
    		ctx
    	});

    	return block;
    }

    // (309:4) <ToggleConfetti>
    function create_default_slot_12(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { x: [-0.25, 0.25], y: [-0.75, -0.25] },
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
    		source: "(309:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (310:5) 
    function create_label_slot_12(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Down";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 309, 5, 7509);
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
    		source: "(310:5) ",
    		ctx
    	});

    	return block;
    }

    // (323:4) <ToggleConfetti>
    function create_default_slot_11(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { x: [-0.5, 0.5], y: [-0.5, 0.5] },
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
    		source: "(323:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (324:5) 
    function create_label_slot_11(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Everywhere";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 323, 5, 7842);
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
    		source: "(324:5) ",
    		ctx
    	});

    	return block;
    }

    // (345:4) <ToggleConfetti>
    function create_default_slot_10(ctx) {
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
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(345:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (346:5) 
    function create_label_slot_10(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Few";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 345, 5, 8590);
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
    		source: "(346:5) ",
    		ctx
    	});

    	return block;
    }

    // (359:4) <ToggleConfetti>
    function create_default_slot_9(ctx) {
    	let confetti;
    	let current;
    	confetti = new Confetti({ props: { amount: "50" }, $$inline: true });

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
    		source: "(359:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (360:5) 
    function create_label_slot_9(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 359, 5, 8845);
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
    		source: "(360:5) ",
    		ctx
    	});

    	return block;
    }

    // (373:4) <ToggleConfetti>
    function create_default_slot_8(ctx) {
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
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(373:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (374:5) 
    function create_label_slot_8(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Lots";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 373, 5, 9104);
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
    		source: "(374:5) ",
    		ctx
    	});

    	return block;
    }

    // (387:4) <ToggleConfetti>
    function create_default_slot_7(ctx) {
    	let confetti;
    	let current;
    	confetti = new Confetti({ props: { amount: "500" }, $$inline: true });

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
    		source: "(387:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (388:5) 
    function create_label_slot_7(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Too many";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 387, 5, 9362);
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
    		source: "(388:5) ",
    		ctx
    	});

    	return block;
    }

    // (409:4) <ToggleConfetti>
    function create_default_slot_6(ctx) {
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
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(409:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (410:5) 
    function create_label_slot_6(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 409, 5, 10037);
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
    		source: "(410:5) ",
    		ctx
    	});

    	return block;
    }

    // (423:4) <ToggleConfetti>
    function create_default_slot_5(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { cone: true, amount: "200" },
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
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(423:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (424:5) 
    function create_label_slot_5(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 423, 5, 10285);
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
    		source: "(424:5) ",
    		ctx
    	});

    	return block;
    }

    // (447:4) <ToggleConfetti>
    function create_default_slot_4(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { delay: [0, 250] },
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
    		source: "(447:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (448:5) 
    function create_label_slot_4(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Short delay";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 447, 5, 11070);
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
    		source: "(448:5) ",
    		ctx
    	});

    	return block;
    }

    // (461:4) <ToggleConfetti>
    function create_default_slot_3(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { delay: [0, 1500] },
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
    		source: "(461:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (462:5) 
    function create_label_slot_3(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Long delay";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 461, 5, 11352);
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
    		source: "(462:5) ",
    		ctx
    	});

    	return block;
    }

    // (477:4) <ToggleConfetti toggleOnce>
    function create_default_slot_2(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { infinite: true },
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
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(477:4) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (478:5) 
    function create_label_slot_2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 477, 5, 11881);
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
    		source: "(478:5) ",
    		ctx
    	});

    	return block;
    }

    // (491:4) <ToggleConfetti toggleOnce>
    function create_default_slot_1(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { infinite: true, delay: [0, 1500] },
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
    		source: "(491:4) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (492:5) 
    function create_label_slot_1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Long delay";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 491, 5, 12149);
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
    		source: "(492:5) ",
    		ctx
    	});

    	return block;
    }

    // (507:4) <ToggleConfetti toggleOnce>
    function create_default_slot(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { iterationCount: "infinite" },
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(507:4) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (508:5) 
    function create_label_slot(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Infinite";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1ef5vg4");
    			add_location(button, file, 507, 5, 12873);
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
    		source: "(508:5) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div47;
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
    	let mark6;
    	let t62;
    	let div6;
    	let div5;
    	let t63;
    	let code4;
    	let t65;
    	let toggleconfetti18;
    	let t66;
    	let div14;
    	let h30;
    	let t68;
    	let div13;
    	let t69;
    	let mark7;
    	let t71;
    	let mark8;
    	let t73;
    	let div7;
    	let toggleconfetti19;
    	let t74;
    	let code5;
    	let t75;
    	let mark9;
    	let t77;
    	let mark10;
    	let t79;
    	let t80;
    	let div8;
    	let toggleconfetti20;
    	let t81;
    	let code6;
    	let t82;
    	let mark11;
    	let t84;
    	let mark12;
    	let t86;
    	let t87;
    	let div9;
    	let toggleconfetti21;
    	let t88;
    	let code7;
    	let t89;
    	let mark13;
    	let t91;
    	let mark14;
    	let t93;
    	let t94;
    	let div10;
    	let toggleconfetti22;
    	let t95;
    	let code8;
    	let t96;
    	let mark15;
    	let t98;
    	let mark16;
    	let t100;
    	let t101;
    	let div11;
    	let toggleconfetti23;
    	let t102;
    	let code9;
    	let t103;
    	let mark17;
    	let t105;
    	let mark18;
    	let t107;
    	let t108;
    	let div12;
    	let toggleconfetti24;
    	let t109;
    	let code10;
    	let t110;
    	let mark19;
    	let t112;
    	let mark20;
    	let t114;
    	let t115;
    	let div20;
    	let h31;
    	let t117;
    	let div19;
    	let t118;
    	let mark21;
    	let t120;
    	let div15;
    	let toggleconfetti25;
    	let t121;
    	let code11;
    	let t122;
    	let mark22;
    	let t124;
    	let t125;
    	let div16;
    	let toggleconfetti26;
    	let t126;
    	let code12;
    	let t127;
    	let mark23;
    	let t129;
    	let t130;
    	let div17;
    	let toggleconfetti27;
    	let t131;
    	let code13;
    	let t132;
    	let mark24;
    	let t134;
    	let t135;
    	let div18;
    	let toggleconfetti28;
    	let t136;
    	let code14;
    	let t137;
    	let mark25;
    	let t139;
    	let t140;
    	let div24;
    	let h32;
    	let t142;
    	let div23;
    	let t143;
    	let strong0;
    	let t145;
    	let div21;
    	let toggleconfetti29;
    	let t146;
    	let code15;
    	let t148;
    	let div22;
    	let toggleconfetti30;
    	let t149;
    	let code16;
    	let t150;
    	let mark26;
    	let t152;
    	let t153;
    	let t154;
    	let div31;
    	let h33;
    	let t156;
    	let div30;
    	let t157;
    	let mark27;
    	let t159;
    	let div25;
    	let toggleconfetti31;
    	let t160;
    	let code17;
    	let t161;
    	let mark28;
    	let t163;
    	let t164;
    	let div26;
    	let toggleconfetti32;
    	let t165;
    	let code18;
    	let t166;
    	let mark29;
    	let t168;
    	let t169;
    	let mark30;
    	let t171;
    	let div27;
    	let toggleconfetti33;
    	let t172;
    	let code19;
    	let t173;
    	let mark31;
    	let t175;
    	let t176;
    	let div28;
    	let toggleconfetti34;
    	let t177;
    	let code20;
    	let t178;
    	let mark32;
    	let t180;
    	let mark33;
    	let t182;
    	let t183;
    	let mark34;
    	let t185;
    	let div29;
    	let toggleconfetti35;
    	let t186;
    	let code21;
    	let t187;
    	let mark35;
    	let t189;
    	let t190;
    	let h23;
    	let t192;
    	let div46;
    	let p5;
    	let t194;
    	let div45;
    	let strong1;
    	let t196;
    	let strong2;
    	let t198;
    	let strong3;
    	let t200;
    	let code22;
    	let t202;
    	let code23;
    	let t204;
    	let div32;
    	let t206;
    	let code24;
    	let t208;
    	let code25;
    	let t210;
    	let div33;
    	let t212;
    	let code26;
    	let t214;
    	let code27;
    	let t216;
    	let div34;
    	let t218;
    	let code28;
    	let t220;
    	let code29;
    	let t222;
    	let div35;
    	let t224;
    	let code30;
    	let t226;
    	let code31;
    	let t228;
    	let div36;
    	let t230;
    	let code32;
    	let t232;
    	let code33;
    	let t234;
    	let div37;
    	let t236;
    	let code34;
    	let t238;
    	let code35;
    	let t240;
    	let div38;
    	let t242;
    	let code36;
    	let t244;
    	let code37;
    	let t246;
    	let div39;
    	let t248;
    	let code38;
    	let t250;
    	let code39;
    	let t252;
    	let div40;
    	let t254;
    	let code40;
    	let t256;
    	let code41;
    	let t258;
    	let div41;
    	let t260;
    	let code42;
    	let t262;
    	let code43;
    	let t264;
    	let div42;
    	let t266;
    	let code44;
    	let t268;
    	let code45;
    	let t270;
    	let div43;
    	let t272;
    	let code46;
    	let t274;
    	let code47;
    	let t276;
    	let div44;
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
    					label: [create_label_slot_35],
    					default: [create_default_slot_35]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti1 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_34],
    					default: [create_default_slot_34]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti2 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_33],
    					default: [create_default_slot_33]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti3 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_32],
    					default: [create_default_slot_32]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti4 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_31],
    					default: [create_default_slot_31]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti5 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_30],
    					default: [create_default_slot_30]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti6 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_29],
    					default: [create_default_slot_29]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti7 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_28],
    					default: [create_default_slot_28]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti8 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_27],
    					default: [create_default_slot_27]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti9 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_26],
    					default: [create_default_slot_26]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti10 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_25],
    					default: [create_default_slot_25]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti11 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_24],
    					default: [create_default_slot_24]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti12 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_23],
    					default: [create_default_slot_23]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti13 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_22],
    					default: [create_default_slot_22]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti14 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_21],
    					default: [create_default_slot_21]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti15 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_20],
    					default: [create_default_slot_20]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti16 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_19],
    					default: [create_default_slot_19]
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
    					label: [create_label_slot_18],
    					default: [create_default_slot_18]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti18 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_17],
    					default: [create_default_slot_17]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti19 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_16],
    					default: [create_default_slot_16]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti20 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_15],
    					default: [create_default_slot_15]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti21 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_14],
    					default: [create_default_slot_14]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti22 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_13],
    					default: [create_default_slot_13]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti23 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_12],
    					default: [create_default_slot_12]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti24 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_11],
    					default: [create_default_slot_11]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti25 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_10],
    					default: [create_default_slot_10]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti26 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_9],
    					default: [create_default_slot_9]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti27 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_8],
    					default: [create_default_slot_8]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti28 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_7],
    					default: [create_default_slot_7]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti29 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_6],
    					default: [create_default_slot_6]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti30 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_5],
    					default: [create_default_slot_5]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti31 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_4],
    					default: [create_default_slot_4]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti32 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_3],
    					default: [create_default_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti33 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_2],
    					default: [create_default_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti34 = new ToggleConfetti({
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

    	toggleconfetti35 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
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
    			div47 = element("div");
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
    			h22.textContent = "Usage";
    			t60 = space();
    			mark6 = element("mark");
    			mark6.textContent = "The Confetti comes without the buttons you will see in these examples. The buttons are simply used to trigger the event in these docs.";
    			t62 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t63 = text("The component in it's most basic form.\r\n\r\n\t\t\t");
    			code4 = element("code");
    			code4.textContent = "<Confetti />";
    			t65 = space();
    			create_component(toggleconfetti18.$$.fragment);
    			t66 = space();
    			div14 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Spread";
    			t68 = space();
    			div13 = element("div");
    			t69 = text("The spread of confetti can be adjusted. The props ");
    			mark7 = element("mark");
    			mark7.textContent = "x";
    			t71 = text(" and ");
    			mark8 = element("mark");
    			mark8.textContent = "y";
    			t73 = text(" are used to determine how far the confetti spreads. For both values multipliers are used and these are to be supplied in an array of two with the lowest number first. For each confetti piece a random number between these two is picked. The higher the number the futher the spread. Negative numbers affect the direction.\r\n\r\n\t\t\t");
    			div7 = element("div");
    			create_component(toggleconfetti19.$$.fragment);
    			t74 = space();
    			code5 = element("code");
    			t75 = text("<Confetti ");
    			mark9 = element("mark");
    			mark9.textContent = "x";
    			t77 = text("={[-0.5, 0.5]} ");
    			mark10 = element("mark");
    			mark10.textContent = "y";
    			t79 = text("={[0.25, 1]} />");
    			t80 = space();
    			div8 = element("div");
    			create_component(toggleconfetti20.$$.fragment);
    			t81 = space();
    			code6 = element("code");
    			t82 = text("<Confetti ");
    			mark11 = element("mark");
    			mark11.textContent = "x";
    			t84 = text("={[-1, -0.25]} ");
    			mark12 = element("mark");
    			mark12.textContent = "y";
    			t86 = text("={[0, 0.5]} />");
    			t87 = space();
    			div9 = element("div");
    			create_component(toggleconfetti21.$$.fragment);
    			t88 = space();
    			code7 = element("code");
    			t89 = text("<Confetti ");
    			mark13 = element("mark");
    			mark13.textContent = "x";
    			t91 = text("={[0.25, 1]} ");
    			mark14 = element("mark");
    			mark14.textContent = "y";
    			t93 = text("={[0, 0.5]} />");
    			t94 = space();
    			div10 = element("div");
    			create_component(toggleconfetti22.$$.fragment);
    			t95 = space();
    			code8 = element("code");
    			t96 = text("<Confetti ");
    			mark15 = element("mark");
    			mark15.textContent = "x";
    			t98 = text("={[-0.25, 0.25]} ");
    			mark16 = element("mark");
    			mark16.textContent = "y";
    			t100 = text("={[0.75, 1.5]} />");
    			t101 = space();
    			div11 = element("div");
    			create_component(toggleconfetti23.$$.fragment);
    			t102 = space();
    			code9 = element("code");
    			t103 = text("<Confetti ");
    			mark17 = element("mark");
    			mark17.textContent = "x";
    			t105 = text("={[-0.25, 0.25]} ");
    			mark18 = element("mark");
    			mark18.textContent = "y";
    			t107 = text("={[-0.75, -0.25]} />");
    			t108 = space();
    			div12 = element("div");
    			create_component(toggleconfetti24.$$.fragment);
    			t109 = space();
    			code10 = element("code");
    			t110 = text("<Confetti ");
    			mark19 = element("mark");
    			mark19.textContent = "x";
    			t112 = text("={[-0.5, 0.5]} ");
    			mark20 = element("mark");
    			mark20.textContent = "y";
    			t114 = text("={[-0.5, -0.5]} />");
    			t115 = space();
    			div20 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Amount";
    			t117 = space();
    			div19 = element("div");
    			t118 = text("The amount of particles that are launched can be adjusted with the ");
    			mark21 = element("mark");
    			mark21.textContent = "amount";
    			t120 = text(" property. This should always be a whole number. Be careful with going too high as it may impact performance. It will depends on the device and other performance heavy elements on the page, but try and keep it below 500.\r\n\r\n\t\t\t");
    			div15 = element("div");
    			create_component(toggleconfetti25.$$.fragment);
    			t121 = space();
    			code11 = element("code");
    			t122 = text("<Confetti ");
    			mark22 = element("mark");
    			mark22.textContent = "amount";
    			t124 = text("=10 />");
    			t125 = space();
    			div16 = element("div");
    			create_component(toggleconfetti26.$$.fragment);
    			t126 = space();
    			code12 = element("code");
    			t127 = text("<Confetti ");
    			mark23 = element("mark");
    			mark23.textContent = "amount";
    			t129 = text("=50 />");
    			t130 = space();
    			div17 = element("div");
    			create_component(toggleconfetti27.$$.fragment);
    			t131 = space();
    			code13 = element("code");
    			t132 = text("<Confetti ");
    			mark24 = element("mark");
    			mark24.textContent = "amount";
    			t134 = text("=200 />");
    			t135 = space();
    			div18 = element("div");
    			create_component(toggleconfetti28.$$.fragment);
    			t136 = space();
    			code14 = element("code");
    			t137 = text("<Confetti ");
    			mark25 = element("mark");
    			mark25.textContent = "amount";
    			t139 = text("=500 />");
    			t140 = space();
    			div24 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Shape";
    			t142 = space();
    			div23 = element("div");
    			t143 = text("As you may have noticed from the previous buttons, the confetti tends to take on a fairly square shape. This can be mitigated a little bit by using the propery ");
    			strong0 = element("strong");
    			strong0.textContent = "cone";
    			t145 = text(". This will cause the confetti to launch in a more cone like shape which is especially nice when using lots of particles.\r\n\r\n\t\t\t");
    			div21 = element("div");
    			create_component(toggleconfetti29.$$.fragment);
    			t146 = space();
    			code15 = element("code");
    			code15.textContent = "<Confetti amount=200 />";
    			t148 = space();
    			div22 = element("div");
    			create_component(toggleconfetti30.$$.fragment);
    			t149 = space();
    			code16 = element("code");
    			t150 = text("<Confetti ");
    			mark26 = element("mark");
    			mark26.textContent = "cone";
    			t152 = text(" amount=200 />");
    			t153 = text("\r\n\r\n\t\t\tA little bit later in these docs we will go over how to mitigate this effect further to get it to look real nice.");
    			t154 = space();
    			div31 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Timing";
    			t156 = space();
    			div30 = element("div");
    			t157 = text("By default all confetti comes out at just about the same time. It's a little bit of variance but it appears instant. That's what a confetti cannon does. We can change when each piece is fired by adjusted the range of the ");
    			mark27 = element("mark");
    			mark27.textContent = "delay";
    			t159 = text(" property. The delay is given in milliseconds.\r\n\r\n\t\t\t");
    			div25 = element("div");
    			create_component(toggleconfetti31.$$.fragment);
    			t160 = space();
    			code17 = element("code");
    			t161 = text("<Confetti ");
    			mark28 = element("mark");
    			mark28.textContent = "delay";
    			t163 = text("={[0, 250]} />");
    			t164 = space();
    			div26 = element("div");
    			create_component(toggleconfetti32.$$.fragment);
    			t165 = space();
    			code18 = element("code");
    			t166 = text("<Confetti ");
    			mark29 = element("mark");
    			mark29.textContent = "delay";
    			t168 = text("={[0, 1500]} />");
    			t169 = text("\r\n\r\n\t\t\tWe can also opt to have the animation play infinitely by setting the ");
    			mark30 = element("mark");
    			mark30.textContent = "infinite";
    			t171 = text(" property, at this point the delay mostly has a effect only when spawning in for the first time. (Click the button again to toggle it off)\r\n\r\n\t\t\t");
    			div27 = element("div");
    			create_component(toggleconfetti33.$$.fragment);
    			t172 = space();
    			code19 = element("code");
    			t173 = text("<Confetti ");
    			mark31 = element("mark");
    			mark31.textContent = "infinite";
    			t175 = text(" />");
    			t176 = space();
    			div28 = element("div");
    			create_component(toggleconfetti34.$$.fragment);
    			t177 = space();
    			code20 = element("code");
    			t178 = text("<Confetti ");
    			mark32 = element("mark");
    			mark32.textContent = "infinite";
    			t180 = space();
    			mark33 = element("mark");
    			mark33.textContent = "delay";
    			t182 = text("={[0, 1500]} />");
    			t183 = text("\r\n\r\n\t\t\tAlternatively we can let the animation play out fully before repeating. For this we can use the ");
    			mark34 = element("mark");
    			mark34.textContent = "iterationCount";
    			t185 = text(" property. This is especially useful during development to tweak the confetti without having to reload the page or set up a button. This can be set to a number or to \"infinite\", basically anything that would be accepted by the animation-iteration-count property in CSS.\r\n\r\n\t\t\t");
    			div29 = element("div");
    			create_component(toggleconfetti35.$$.fragment);
    			t186 = space();
    			code21 = element("code");
    			t187 = text("<Confetti ");
    			mark35 = element("mark");
    			mark35.textContent = "iterationCount";
    			t189 = text("=infinite />");
    			t190 = space();
    			h23 = element("h2");
    			h23.textContent = "Properties";
    			t192 = space();
    			div46 = element("div");
    			p5 = element("p");
    			p5.textContent = "This is a list of all configurable properties.";
    			t194 = space();
    			div45 = element("div");
    			strong1 = element("strong");
    			strong1.textContent = "Property";
    			t196 = space();
    			strong2 = element("strong");
    			strong2.textContent = "Default";
    			t198 = space();
    			strong3 = element("strong");
    			strong3.textContent = "Description";
    			t200 = space();
    			code22 = element("code");
    			code22.textContent = "size";
    			t202 = space();
    			code23 = element("code");
    			code23.textContent = "10";
    			t204 = space();
    			div32 = element("div");
    			div32.textContent = "The max size in pixels of the individual confetti pieces.";
    			t206 = space();
    			code24 = element("code");
    			code24.textContent = "x";
    			t208 = space();
    			code25 = element("code");
    			code25.textContent = "[-0.5, 0.5]";
    			t210 = space();
    			div33 = element("div");
    			div33.textContent = "The max horizontal range of the confetti pieces. Negative is left, positive is right. [-1, 1] would mean maximum of 200px left and 200px right.";
    			t212 = space();
    			code26 = element("code");
    			code26.textContent = "y";
    			t214 = space();
    			code27 = element("code");
    			code27.textContent = "[0.25, 1]";
    			t216 = space();
    			div34 = element("div");
    			div34.textContent = "The max vertical range of the confetti pieces. Negative is down, positive is ip. [-1, 1] would mean maximum of 200px down and 200px up.";
    			t218 = space();
    			code28 = element("code");
    			code28.textContent = "duration";
    			t220 = space();
    			code29 = element("code");
    			code29.textContent = "2000";
    			t222 = space();
    			div35 = element("div");
    			div35.textContent = "Duration of the animation for each individual piece.";
    			t224 = space();
    			code30 = element("code");
    			code30.textContent = "infinite";
    			t226 = space();
    			code31 = element("code");
    			code31.textContent = "false";
    			t228 = space();
    			div36 = element("div");
    			div36.textContent = "If set to true the animation will play indefinitely.";
    			t230 = space();
    			code32 = element("code");
    			code32.textContent = "delay";
    			t232 = space();
    			code33 = element("code");
    			code33.textContent = "[0, 50]";
    			t234 = space();
    			div37 = element("div");
    			div37.textContent = "Used to set a random delay for each piece. A large difference between each number will mean a longer spray time.";
    			t236 = space();
    			code34 = element("code");
    			code34.textContent = "colorRange";
    			t238 = space();
    			code35 = element("code");
    			code35.textContent = "[0, 360]";
    			t240 = space();
    			div38 = element("div");
    			div38.textContent = "Color range on the HSL color wheel. 0 to 360 is full RGB. 75 To 150 would be only green colors.";
    			t242 = space();
    			code36 = element("code");
    			code36.textContent = "colorArray";
    			t244 = space();
    			code37 = element("code");
    			code37.textContent = "[]";
    			t246 = space();
    			div39 = element("div");
    			div39.textContent = "Can be used to pick a random color from this array. Set just one array elements to have a single color. Accepts any viable css background property, including gradients and images.";
    			t248 = space();
    			code38 = element("code");
    			code38.textContent = "amount";
    			t250 = space();
    			code39 = element("code");
    			code39.textContent = "50";
    			t252 = space();
    			div40 = element("div");
    			div40.textContent = "Amount of particles spawned. The larger your spray the more pieces you might want. Be careful with too many as it might impact performance.";
    			t254 = space();
    			code40 = element("code");
    			code40.textContent = "iterationCount";
    			t256 = space();
    			code41 = element("code");
    			code41.textContent = "1";
    			t258 = space();
    			div41 = element("div");
    			div41.textContent = "How many times the animation will play before stopping. Is overwritten by the \"infinite\" property.";
    			t260 = space();
    			code42 = element("code");
    			code42.textContent = "fallDistance";
    			t262 = space();
    			code43 = element("code");
    			code43.textContent = "\"200px\"";
    			t264 = space();
    			div42 = element("div");
    			div42.textContent = "How far each piece falls. Accepts any css property, px, rem, vh, etc.";
    			t266 = space();
    			code44 = element("code");
    			code44.textContent = "rounded";
    			t268 = space();
    			code45 = element("code");
    			code45.textContent = "false";
    			t270 = space();
    			div43 = element("div");
    			div43.textContent = "Set to true to make each confetti piece rounded.";
    			t272 = space();
    			code46 = element("code");
    			code46.textContent = "cone";
    			t274 = space();
    			code47 = element("code");
    			code47.textContent = "false";
    			t276 = space();
    			div44 = element("div");
    			div44.textContent = "Set to true to make the explosion appear in a cone like shape which might feel more realistic when dealing with a larger amount.";
    			attr_dev(mark0, "class", "svelte-1ef5vg4");
    			add_location(mark0, file, 18, 3, 340);
    			attr_dev(h1, "class", "svelte-1ef5vg4");
    			add_location(h1, file, 9, 2, 175);
    			attr_dev(div0, "class", "header svelte-1ef5vg4");
    			add_location(div0, file, 8, 1, 151);
    			add_location(em, file, 31, 190, 766);
    			attr_dev(p0, "class", "svelte-1ef5vg4");
    			add_location(p0, file, 31, 2, 578);
    			attr_dev(div1, "class", "reduced-motion-only svelte-1ef5vg4");
    			add_location(div1, file, 33, 2, 820);
    			attr_dev(a0, "href", "https://github.com/Mitcheljager/svelte-confetti");
    			attr_dev(a0, "class", "svelte-1ef5vg4");
    			add_location(a0, file, 37, 5, 997);
    			attr_dev(p1, "class", "svelte-1ef5vg4");
    			add_location(p1, file, 37, 2, 994);
    			attr_dev(h20, "class", "svelte-1ef5vg4");
    			add_location(h20, file, 39, 2, 1075);
    			attr_dev(p2, "class", "svelte-1ef5vg4");
    			add_location(p2, file, 41, 2, 1094);
    			attr_dev(div2, "class", "buttons svelte-1ef5vg4");
    			add_location(div2, file, 43, 2, 1312);
    			attr_dev(h21, "class", "svelte-1ef5vg4");
    			add_location(h21, file, 196, 2, 4630);
    			attr_dev(p3, "class", "svelte-1ef5vg4");
    			add_location(p3, file, 198, 2, 4657);
    			attr_dev(mark1, "class", "svelte-1ef5vg4");
    			add_location(mark1, file, 201, 12, 4729);
    			attr_dev(code0, "class", "well svelte-1ef5vg4");
    			add_location(code0, file, 200, 2, 4696);
    			attr_dev(mark2, "class", "svelte-1ef5vg4");
    			add_location(mark2, file, 205, 22, 4817);
    			attr_dev(code1, "class", "well svelte-1ef5vg4");
    			add_location(code1, file, 204, 2, 4774);
    			attr_dev(p4, "class", "svelte-1ef5vg4");
    			add_location(p4, file, 208, 2, 4862);
    			attr_dev(mark3, "class", "svelte-1ef5vg4");
    			add_location(mark3, file, 211, 17, 4947);
    			attr_dev(mark4, "class", "svelte-1ef5vg4");
    			add_location(mark4, file, 211, 52, 4982);
    			attr_dev(code2, "class", "well svelte-1ef5vg4");
    			add_location(code2, file, 210, 2, 4909);
    			attr_dev(mark5, "class", "svelte-1ef5vg4");
    			add_location(mark5, file, 215, 7, 5056);
    			attr_dev(code3, "class", "well svelte-1ef5vg4");
    			add_location(code3, file, 214, 2, 5028);
    			attr_dev(div3, "class", "block block--single svelte-1ef5vg4");
    			add_location(div3, file, 30, 1, 541);
    			attr_dev(a1, "href", "https://github.com/Mitcheljager");
    			attr_dev(a1, "class", "svelte-1ef5vg4");
    			add_location(a1, file, 220, 10, 5153);
    			attr_dev(div4, "class", "block block--single svelte-1ef5vg4");
    			add_location(div4, file, 219, 1, 5108);
    			attr_dev(h22, "class", "svelte-1ef5vg4");
    			add_location(h22, file, 223, 1, 5226);
    			attr_dev(mark6, "class", "svelte-1ef5vg4");
    			add_location(mark6, file, 225, 1, 5245);
    			attr_dev(code4, "class", "svelte-1ef5vg4");
    			add_location(code4, file, 231, 3, 5495);
    			attr_dev(div5, "class", "description svelte-1ef5vg4");
    			add_location(div5, file, 228, 2, 5420);
    			attr_dev(div6, "class", "block svelte-1ef5vg4");
    			add_location(div6, file, 227, 1, 5397);
    			attr_dev(h30, "class", "svelte-1ef5vg4");
    			add_location(h30, file, 246, 2, 5710);
    			attr_dev(mark7, "class", "svelte-1ef5vg4");
    			add_location(mark7, file, 249, 53, 5811);
    			attr_dev(mark8, "class", "svelte-1ef5vg4");
    			add_location(mark8, file, 249, 72, 5830);
    			attr_dev(mark9, "class", "svelte-1ef5vg4");
    			add_location(mark9, file, 261, 18, 6391);
    			attr_dev(mark10, "class", "svelte-1ef5vg4");
    			add_location(mark10, file, 261, 52, 6425);
    			attr_dev(code5, "class", "svelte-1ef5vg4");
    			add_location(code5, file, 260, 4, 6365);
    			attr_dev(div7, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div7, file, 251, 3, 6171);
    			attr_dev(mark11, "class", "svelte-1ef5vg4");
    			add_location(mark11, file, 275, 18, 6709);
    			attr_dev(mark12, "class", "svelte-1ef5vg4");
    			add_location(mark12, file, 275, 52, 6743);
    			attr_dev(code6, "class", "svelte-1ef5vg4");
    			add_location(code6, file, 274, 4, 6683);
    			attr_dev(div8, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div8, file, 265, 3, 6493);
    			attr_dev(mark13, "class", "svelte-1ef5vg4");
    			add_location(mark13, file, 289, 18, 7025);
    			attr_dev(mark14, "class", "svelte-1ef5vg4");
    			add_location(mark14, file, 289, 50, 7057);
    			attr_dev(code7, "class", "svelte-1ef5vg4");
    			add_location(code7, file, 288, 4, 6999);
    			attr_dev(div9, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div9, file, 279, 3, 6810);
    			attr_dev(mark15, "class", "svelte-1ef5vg4");
    			add_location(mark15, file, 303, 18, 7343);
    			attr_dev(mark16, "class", "svelte-1ef5vg4");
    			add_location(mark16, file, 303, 54, 7379);
    			attr_dev(code8, "class", "svelte-1ef5vg4");
    			add_location(code8, file, 302, 4, 7317);
    			attr_dev(div10, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div10, file, 293, 3, 7124);
    			attr_dev(mark17, "class", "svelte-1ef5vg4");
    			add_location(mark17, file, 317, 18, 7673);
    			attr_dev(mark18, "class", "svelte-1ef5vg4");
    			add_location(mark18, file, 317, 54, 7709);
    			attr_dev(code9, "class", "svelte-1ef5vg4");
    			add_location(code9, file, 316, 4, 7647);
    			attr_dev(div11, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div11, file, 307, 3, 7449);
    			attr_dev(mark19, "class", "svelte-1ef5vg4");
    			add_location(mark19, file, 331, 18, 8007);
    			attr_dev(mark20, "class", "svelte-1ef5vg4");
    			add_location(mark20, file, 331, 52, 8041);
    			attr_dev(code10, "class", "svelte-1ef5vg4");
    			add_location(code10, file, 330, 4, 7981);
    			attr_dev(div12, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div12, file, 321, 3, 7782);
    			attr_dev(div13, "class", "description svelte-1ef5vg4");
    			add_location(div13, file, 248, 2, 5731);
    			attr_dev(div14, "class", "block block--single svelte-1ef5vg4");
    			add_location(div14, file, 245, 1, 5673);
    			attr_dev(h31, "class", "svelte-1ef5vg4");
    			add_location(h31, file, 338, 2, 8166);
    			attr_dev(mark21, "class", "svelte-1ef5vg4");
    			add_location(mark21, file, 341, 70, 8284);
    			attr_dev(mark22, "class", "svelte-1ef5vg4");
    			add_location(mark22, file, 353, 18, 8726);
    			attr_dev(code11, "class", "svelte-1ef5vg4");
    			add_location(code11, file, 352, 4, 8700);
    			attr_dev(div15, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div15, file, 343, 3, 8530);
    			attr_dev(mark23, "class", "svelte-1ef5vg4");
    			add_location(mark23, file, 367, 18, 8985);
    			attr_dev(code12, "class", "svelte-1ef5vg4");
    			add_location(code12, file, 366, 4, 8959);
    			attr_dev(div16, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div16, file, 357, 3, 8785);
    			attr_dev(mark24, "class", "svelte-1ef5vg4");
    			add_location(mark24, file, 381, 18, 9242);
    			attr_dev(code13, "class", "svelte-1ef5vg4");
    			add_location(code13, file, 380, 4, 9216);
    			attr_dev(div17, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div17, file, 371, 3, 9044);
    			attr_dev(mark25, "class", "svelte-1ef5vg4");
    			add_location(mark25, file, 395, 18, 9504);
    			attr_dev(code14, "class", "svelte-1ef5vg4");
    			add_location(code14, file, 394, 4, 9478);
    			attr_dev(div18, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div18, file, 385, 3, 9302);
    			attr_dev(div19, "class", "description svelte-1ef5vg4");
    			add_location(div19, file, 340, 2, 8187);
    			attr_dev(div20, "class", "block block--single svelte-1ef5vg4");
    			add_location(div20, file, 337, 1, 8129);
    			attr_dev(h32, "class", "svelte-1ef5vg4");
    			add_location(h32, file, 402, 2, 9618);
    			add_location(strong0, file, 405, 163, 9828);
    			attr_dev(code15, "class", "svelte-1ef5vg4");
    			add_location(code15, file, 416, 4, 10152);
    			attr_dev(div21, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div21, file, 407, 3, 9977);
    			attr_dev(mark26, "class", "svelte-1ef5vg4");
    			add_location(mark26, file, 431, 18, 10428);
    			attr_dev(code16, "class", "svelte-1ef5vg4");
    			add_location(code16, file, 430, 4, 10402);
    			attr_dev(div22, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div22, file, 421, 3, 10225);
    			attr_dev(div23, "class", "description svelte-1ef5vg4");
    			add_location(div23, file, 404, 2, 9638);
    			attr_dev(div24, "class", "block block--single svelte-1ef5vg4");
    			add_location(div24, file, 401, 1, 9581);
    			attr_dev(h33, "class", "svelte-1ef5vg4");
    			add_location(h33, file, 440, 2, 10667);
    			attr_dev(mark27, "class", "svelte-1ef5vg4");
    			add_location(mark27, file, 443, 224, 10939);
    			attr_dev(mark28, "class", "svelte-1ef5vg4");
    			add_location(mark28, file, 455, 18, 11221);
    			attr_dev(code17, "class", "svelte-1ef5vg4");
    			add_location(code17, file, 454, 4, 11195);
    			attr_dev(div25, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div25, file, 445, 3, 11010);
    			attr_dev(mark29, "class", "svelte-1ef5vg4");
    			add_location(mark29, file, 469, 18, 11503);
    			attr_dev(code18, "class", "svelte-1ef5vg4");
    			add_location(code18, file, 468, 4, 11477);
    			attr_dev(div26, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div26, file, 459, 3, 11292);
    			attr_dev(mark30, "class", "svelte-1ef5vg4");
    			add_location(mark30, file, 473, 72, 11644);
    			attr_dev(mark31, "class", "svelte-1ef5vg4");
    			add_location(mark31, file, 485, 18, 12020);
    			attr_dev(code19, "class", "svelte-1ef5vg4");
    			add_location(code19, file, 484, 4, 11994);
    			attr_dev(div27, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div27, file, 475, 3, 11810);
    			attr_dev(mark32, "class", "svelte-1ef5vg4");
    			add_location(mark32, file, 499, 18, 12309);
    			attr_dev(mark33, "class", "svelte-1ef5vg4");
    			add_location(mark33, file, 499, 40, 12331);
    			attr_dev(code20, "class", "svelte-1ef5vg4");
    			add_location(code20, file, 498, 4, 12283);
    			attr_dev(div28, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div28, file, 489, 3, 12078);
    			attr_dev(mark34, "class", "svelte-1ef5vg4");
    			add_location(mark34, file, 503, 99, 12499);
    			attr_dev(mark35, "class", "svelte-1ef5vg4");
    			add_location(mark35, file, 515, 18, 13028);
    			attr_dev(code21, "class", "svelte-1ef5vg4");
    			add_location(code21, file, 514, 4, 13002);
    			attr_dev(div29, "class", "button-code-group svelte-1ef5vg4");
    			add_location(div29, file, 505, 3, 12802);
    			attr_dev(div30, "class", "description svelte-1ef5vg4");
    			add_location(div30, file, 442, 2, 10688);
    			attr_dev(div31, "class", "block block--single svelte-1ef5vg4");
    			add_location(div31, file, 439, 1, 10630);
    			attr_dev(h23, "class", "svelte-1ef5vg4");
    			add_location(h23, file, 522, 1, 13120);
    			attr_dev(p5, "class", "svelte-1ef5vg4");
    			add_location(p5, file, 525, 2, 13181);
    			attr_dev(strong1, "class", "svelte-1ef5vg4");
    			add_location(strong1, file, 528, 3, 13264);
    			attr_dev(strong2, "class", "svelte-1ef5vg4");
    			add_location(strong2, file, 528, 29, 13290);
    			attr_dev(strong3, "class", "svelte-1ef5vg4");
    			add_location(strong3, file, 528, 54, 13315);
    			attr_dev(code22, "class", "svelte-1ef5vg4");
    			add_location(code22, file, 530, 3, 13350);
    			attr_dev(code23, "class", "svelte-1ef5vg4");
    			add_location(code23, file, 530, 21, 13368);
    			add_location(div32, file, 530, 37, 13384);
    			attr_dev(code24, "class", "svelte-1ef5vg4");
    			add_location(code24, file, 531, 3, 13457);
    			attr_dev(code25, "class", "svelte-1ef5vg4");
    			add_location(code25, file, 531, 18, 13472);
    			add_location(div33, file, 531, 43, 13497);
    			attr_dev(code26, "class", "svelte-1ef5vg4");
    			add_location(code26, file, 532, 3, 13656);
    			attr_dev(code27, "class", "svelte-1ef5vg4");
    			add_location(code27, file, 532, 18, 13671);
    			add_location(div34, file, 532, 41, 13694);
    			attr_dev(code28, "class", "svelte-1ef5vg4");
    			add_location(code28, file, 533, 3, 13845);
    			attr_dev(code29, "class", "svelte-1ef5vg4");
    			add_location(code29, file, 533, 25, 13867);
    			add_location(div35, file, 533, 43, 13885);
    			attr_dev(code30, "class", "svelte-1ef5vg4");
    			add_location(code30, file, 534, 3, 13953);
    			attr_dev(code31, "class", "svelte-1ef5vg4");
    			add_location(code31, file, 534, 25, 13975);
    			add_location(div36, file, 534, 44, 13994);
    			attr_dev(code32, "class", "svelte-1ef5vg4");
    			add_location(code32, file, 535, 3, 14062);
    			attr_dev(code33, "class", "svelte-1ef5vg4");
    			add_location(code33, file, 535, 22, 14081);
    			add_location(div37, file, 535, 43, 14102);
    			attr_dev(code34, "class", "svelte-1ef5vg4");
    			add_location(code34, file, 536, 3, 14230);
    			attr_dev(code35, "class", "svelte-1ef5vg4");
    			add_location(code35, file, 536, 27, 14254);
    			add_location(div38, file, 536, 49, 14276);
    			attr_dev(code36, "class", "svelte-1ef5vg4");
    			add_location(code36, file, 537, 3, 14387);
    			attr_dev(code37, "class", "svelte-1ef5vg4");
    			add_location(code37, file, 537, 27, 14411);
    			add_location(div39, file, 537, 43, 14427);
    			attr_dev(code38, "class", "svelte-1ef5vg4");
    			add_location(code38, file, 538, 3, 14622);
    			attr_dev(code39, "class", "svelte-1ef5vg4");
    			add_location(code39, file, 538, 23, 14642);
    			add_location(div40, file, 538, 39, 14658);
    			attr_dev(code40, "class", "svelte-1ef5vg4");
    			add_location(code40, file, 539, 3, 14813);
    			attr_dev(code41, "class", "svelte-1ef5vg4");
    			add_location(code41, file, 539, 31, 14841);
    			add_location(div41, file, 539, 46, 14856);
    			attr_dev(code42, "class", "svelte-1ef5vg4");
    			add_location(code42, file, 540, 3, 14970);
    			attr_dev(code43, "class", "svelte-1ef5vg4");
    			add_location(code43, file, 540, 29, 14996);
    			add_location(div42, file, 540, 50, 15017);
    			attr_dev(code44, "class", "svelte-1ef5vg4");
    			add_location(code44, file, 541, 3, 15102);
    			attr_dev(code45, "class", "svelte-1ef5vg4");
    			add_location(code45, file, 541, 24, 15123);
    			add_location(div43, file, 541, 43, 15142);
    			attr_dev(code46, "class", "svelte-1ef5vg4");
    			add_location(code46, file, 542, 3, 15206);
    			attr_dev(code47, "class", "svelte-1ef5vg4");
    			add_location(code47, file, 542, 21, 15224);
    			add_location(div44, file, 542, 40, 15243);
    			attr_dev(div45, "class", "table svelte-1ef5vg4");
    			add_location(div45, file, 527, 2, 13240);
    			attr_dev(div46, "class", "block block--single svelte-1ef5vg4");
    			add_location(div46, file, 524, 1, 13144);
    			attr_dev(div47, "class", "wrapper svelte-1ef5vg4");
    			add_location(div47, file, 7, 0, 127);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div47, anchor);
    			append_dev(div47, div0);
    			append_dev(div0, h1);
    			mount_component(confetti0, h1, null);
    			append_dev(h1, t0);
    			append_dev(h1, mark0);
    			append_dev(h1, t2);
    			mount_component(confetti1, h1, null);
    			append_dev(div47, t3);
    			append_dev(div47, div3);
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
    			append_dev(div47, t55);
    			append_dev(div47, div4);
    			append_dev(div4, t56);
    			append_dev(div4, a1);
    			append_dev(div47, t58);
    			append_dev(div47, h22);
    			append_dev(div47, t60);
    			append_dev(div47, mark6);
    			append_dev(div47, t62);
    			append_dev(div47, div6);
    			append_dev(div6, div5);
    			append_dev(div5, t63);
    			append_dev(div5, code4);
    			append_dev(div6, t65);
    			mount_component(toggleconfetti18, div6, null);
    			append_dev(div47, t66);
    			append_dev(div47, div14);
    			append_dev(div14, h30);
    			append_dev(div14, t68);
    			append_dev(div14, div13);
    			append_dev(div13, t69);
    			append_dev(div13, mark7);
    			append_dev(div13, t71);
    			append_dev(div13, mark8);
    			append_dev(div13, t73);
    			append_dev(div13, div7);
    			mount_component(toggleconfetti19, div7, null);
    			append_dev(div7, t74);
    			append_dev(div7, code5);
    			append_dev(code5, t75);
    			append_dev(code5, mark9);
    			append_dev(code5, t77);
    			append_dev(code5, mark10);
    			append_dev(code5, t79);
    			append_dev(div13, t80);
    			append_dev(div13, div8);
    			mount_component(toggleconfetti20, div8, null);
    			append_dev(div8, t81);
    			append_dev(div8, code6);
    			append_dev(code6, t82);
    			append_dev(code6, mark11);
    			append_dev(code6, t84);
    			append_dev(code6, mark12);
    			append_dev(code6, t86);
    			append_dev(div13, t87);
    			append_dev(div13, div9);
    			mount_component(toggleconfetti21, div9, null);
    			append_dev(div9, t88);
    			append_dev(div9, code7);
    			append_dev(code7, t89);
    			append_dev(code7, mark13);
    			append_dev(code7, t91);
    			append_dev(code7, mark14);
    			append_dev(code7, t93);
    			append_dev(div13, t94);
    			append_dev(div13, div10);
    			mount_component(toggleconfetti22, div10, null);
    			append_dev(div10, t95);
    			append_dev(div10, code8);
    			append_dev(code8, t96);
    			append_dev(code8, mark15);
    			append_dev(code8, t98);
    			append_dev(code8, mark16);
    			append_dev(code8, t100);
    			append_dev(div13, t101);
    			append_dev(div13, div11);
    			mount_component(toggleconfetti23, div11, null);
    			append_dev(div11, t102);
    			append_dev(div11, code9);
    			append_dev(code9, t103);
    			append_dev(code9, mark17);
    			append_dev(code9, t105);
    			append_dev(code9, mark18);
    			append_dev(code9, t107);
    			append_dev(div13, t108);
    			append_dev(div13, div12);
    			mount_component(toggleconfetti24, div12, null);
    			append_dev(div12, t109);
    			append_dev(div12, code10);
    			append_dev(code10, t110);
    			append_dev(code10, mark19);
    			append_dev(code10, t112);
    			append_dev(code10, mark20);
    			append_dev(code10, t114);
    			append_dev(div47, t115);
    			append_dev(div47, div20);
    			append_dev(div20, h31);
    			append_dev(div20, t117);
    			append_dev(div20, div19);
    			append_dev(div19, t118);
    			append_dev(div19, mark21);
    			append_dev(div19, t120);
    			append_dev(div19, div15);
    			mount_component(toggleconfetti25, div15, null);
    			append_dev(div15, t121);
    			append_dev(div15, code11);
    			append_dev(code11, t122);
    			append_dev(code11, mark22);
    			append_dev(code11, t124);
    			append_dev(div19, t125);
    			append_dev(div19, div16);
    			mount_component(toggleconfetti26, div16, null);
    			append_dev(div16, t126);
    			append_dev(div16, code12);
    			append_dev(code12, t127);
    			append_dev(code12, mark23);
    			append_dev(code12, t129);
    			append_dev(div19, t130);
    			append_dev(div19, div17);
    			mount_component(toggleconfetti27, div17, null);
    			append_dev(div17, t131);
    			append_dev(div17, code13);
    			append_dev(code13, t132);
    			append_dev(code13, mark24);
    			append_dev(code13, t134);
    			append_dev(div19, t135);
    			append_dev(div19, div18);
    			mount_component(toggleconfetti28, div18, null);
    			append_dev(div18, t136);
    			append_dev(div18, code14);
    			append_dev(code14, t137);
    			append_dev(code14, mark25);
    			append_dev(code14, t139);
    			append_dev(div47, t140);
    			append_dev(div47, div24);
    			append_dev(div24, h32);
    			append_dev(div24, t142);
    			append_dev(div24, div23);
    			append_dev(div23, t143);
    			append_dev(div23, strong0);
    			append_dev(div23, t145);
    			append_dev(div23, div21);
    			mount_component(toggleconfetti29, div21, null);
    			append_dev(div21, t146);
    			append_dev(div21, code15);
    			append_dev(div23, t148);
    			append_dev(div23, div22);
    			mount_component(toggleconfetti30, div22, null);
    			append_dev(div22, t149);
    			append_dev(div22, code16);
    			append_dev(code16, t150);
    			append_dev(code16, mark26);
    			append_dev(code16, t152);
    			append_dev(div23, t153);
    			append_dev(div47, t154);
    			append_dev(div47, div31);
    			append_dev(div31, h33);
    			append_dev(div31, t156);
    			append_dev(div31, div30);
    			append_dev(div30, t157);
    			append_dev(div30, mark27);
    			append_dev(div30, t159);
    			append_dev(div30, div25);
    			mount_component(toggleconfetti31, div25, null);
    			append_dev(div25, t160);
    			append_dev(div25, code17);
    			append_dev(code17, t161);
    			append_dev(code17, mark28);
    			append_dev(code17, t163);
    			append_dev(div30, t164);
    			append_dev(div30, div26);
    			mount_component(toggleconfetti32, div26, null);
    			append_dev(div26, t165);
    			append_dev(div26, code18);
    			append_dev(code18, t166);
    			append_dev(code18, mark29);
    			append_dev(code18, t168);
    			append_dev(div30, t169);
    			append_dev(div30, mark30);
    			append_dev(div30, t171);
    			append_dev(div30, div27);
    			mount_component(toggleconfetti33, div27, null);
    			append_dev(div27, t172);
    			append_dev(div27, code19);
    			append_dev(code19, t173);
    			append_dev(code19, mark31);
    			append_dev(code19, t175);
    			append_dev(div30, t176);
    			append_dev(div30, div28);
    			mount_component(toggleconfetti34, div28, null);
    			append_dev(div28, t177);
    			append_dev(div28, code20);
    			append_dev(code20, t178);
    			append_dev(code20, mark32);
    			append_dev(code20, t180);
    			append_dev(code20, mark33);
    			append_dev(code20, t182);
    			append_dev(div30, t183);
    			append_dev(div30, mark34);
    			append_dev(div30, t185);
    			append_dev(div30, div29);
    			mount_component(toggleconfetti35, div29, null);
    			append_dev(div29, t186);
    			append_dev(div29, code21);
    			append_dev(code21, t187);
    			append_dev(code21, mark35);
    			append_dev(code21, t189);
    			append_dev(div47, t190);
    			append_dev(div47, h23);
    			append_dev(div47, t192);
    			append_dev(div47, div46);
    			append_dev(div46, p5);
    			append_dev(div46, t194);
    			append_dev(div46, div45);
    			append_dev(div45, strong1);
    			append_dev(div45, t196);
    			append_dev(div45, strong2);
    			append_dev(div45, t198);
    			append_dev(div45, strong3);
    			append_dev(div45, t200);
    			append_dev(div45, code22);
    			append_dev(div45, t202);
    			append_dev(div45, code23);
    			append_dev(div45, t204);
    			append_dev(div45, div32);
    			append_dev(div45, t206);
    			append_dev(div45, code24);
    			append_dev(div45, t208);
    			append_dev(div45, code25);
    			append_dev(div45, t210);
    			append_dev(div45, div33);
    			append_dev(div45, t212);
    			append_dev(div45, code26);
    			append_dev(div45, t214);
    			append_dev(div45, code27);
    			append_dev(div45, t216);
    			append_dev(div45, div34);
    			append_dev(div45, t218);
    			append_dev(div45, code28);
    			append_dev(div45, t220);
    			append_dev(div45, code29);
    			append_dev(div45, t222);
    			append_dev(div45, div35);
    			append_dev(div45, t224);
    			append_dev(div45, code30);
    			append_dev(div45, t226);
    			append_dev(div45, code31);
    			append_dev(div45, t228);
    			append_dev(div45, div36);
    			append_dev(div45, t230);
    			append_dev(div45, code32);
    			append_dev(div45, t232);
    			append_dev(div45, code33);
    			append_dev(div45, t234);
    			append_dev(div45, div37);
    			append_dev(div45, t236);
    			append_dev(div45, code34);
    			append_dev(div45, t238);
    			append_dev(div45, code35);
    			append_dev(div45, t240);
    			append_dev(div45, div38);
    			append_dev(div45, t242);
    			append_dev(div45, code36);
    			append_dev(div45, t244);
    			append_dev(div45, code37);
    			append_dev(div45, t246);
    			append_dev(div45, div39);
    			append_dev(div45, t248);
    			append_dev(div45, code38);
    			append_dev(div45, t250);
    			append_dev(div45, code39);
    			append_dev(div45, t252);
    			append_dev(div45, div40);
    			append_dev(div45, t254);
    			append_dev(div45, code40);
    			append_dev(div45, t256);
    			append_dev(div45, code41);
    			append_dev(div45, t258);
    			append_dev(div45, div41);
    			append_dev(div45, t260);
    			append_dev(div45, code42);
    			append_dev(div45, t262);
    			append_dev(div45, code43);
    			append_dev(div45, t264);
    			append_dev(div45, div42);
    			append_dev(div45, t266);
    			append_dev(div45, code44);
    			append_dev(div45, t268);
    			append_dev(div45, code45);
    			append_dev(div45, t270);
    			append_dev(div45, div43);
    			append_dev(div45, t272);
    			append_dev(div45, code46);
    			append_dev(div45, t274);
    			append_dev(div45, code47);
    			append_dev(div45, t276);
    			append_dev(div45, div44);
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
    			const toggleconfetti18_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti18_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti18.$set(toggleconfetti18_changes);
    			const toggleconfetti19_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti19_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti19.$set(toggleconfetti19_changes);
    			const toggleconfetti20_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti20_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti20.$set(toggleconfetti20_changes);
    			const toggleconfetti21_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti21_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti21.$set(toggleconfetti21_changes);
    			const toggleconfetti22_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti22_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti22.$set(toggleconfetti22_changes);
    			const toggleconfetti23_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti23_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti23.$set(toggleconfetti23_changes);
    			const toggleconfetti24_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti24_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti24.$set(toggleconfetti24_changes);
    			const toggleconfetti25_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti25_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti25.$set(toggleconfetti25_changes);
    			const toggleconfetti26_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti26_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti26.$set(toggleconfetti26_changes);
    			const toggleconfetti27_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti27_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti27.$set(toggleconfetti27_changes);
    			const toggleconfetti28_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti28_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti28.$set(toggleconfetti28_changes);
    			const toggleconfetti29_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti29_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti29.$set(toggleconfetti29_changes);
    			const toggleconfetti30_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti30_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti30.$set(toggleconfetti30_changes);
    			const toggleconfetti31_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti31_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti31.$set(toggleconfetti31_changes);
    			const toggleconfetti32_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti32_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti32.$set(toggleconfetti32_changes);
    			const toggleconfetti33_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti33_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti33.$set(toggleconfetti33_changes);
    			const toggleconfetti34_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti34_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti34.$set(toggleconfetti34_changes);
    			const toggleconfetti35_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti35_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti35.$set(toggleconfetti35_changes);
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
    			transition_in(toggleconfetti18.$$.fragment, local);
    			transition_in(toggleconfetti19.$$.fragment, local);
    			transition_in(toggleconfetti20.$$.fragment, local);
    			transition_in(toggleconfetti21.$$.fragment, local);
    			transition_in(toggleconfetti22.$$.fragment, local);
    			transition_in(toggleconfetti23.$$.fragment, local);
    			transition_in(toggleconfetti24.$$.fragment, local);
    			transition_in(toggleconfetti25.$$.fragment, local);
    			transition_in(toggleconfetti26.$$.fragment, local);
    			transition_in(toggleconfetti27.$$.fragment, local);
    			transition_in(toggleconfetti28.$$.fragment, local);
    			transition_in(toggleconfetti29.$$.fragment, local);
    			transition_in(toggleconfetti30.$$.fragment, local);
    			transition_in(toggleconfetti31.$$.fragment, local);
    			transition_in(toggleconfetti32.$$.fragment, local);
    			transition_in(toggleconfetti33.$$.fragment, local);
    			transition_in(toggleconfetti34.$$.fragment, local);
    			transition_in(toggleconfetti35.$$.fragment, local);
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
    			transition_out(toggleconfetti18.$$.fragment, local);
    			transition_out(toggleconfetti19.$$.fragment, local);
    			transition_out(toggleconfetti20.$$.fragment, local);
    			transition_out(toggleconfetti21.$$.fragment, local);
    			transition_out(toggleconfetti22.$$.fragment, local);
    			transition_out(toggleconfetti23.$$.fragment, local);
    			transition_out(toggleconfetti24.$$.fragment, local);
    			transition_out(toggleconfetti25.$$.fragment, local);
    			transition_out(toggleconfetti26.$$.fragment, local);
    			transition_out(toggleconfetti27.$$.fragment, local);
    			transition_out(toggleconfetti28.$$.fragment, local);
    			transition_out(toggleconfetti29.$$.fragment, local);
    			transition_out(toggleconfetti30.$$.fragment, local);
    			transition_out(toggleconfetti31.$$.fragment, local);
    			transition_out(toggleconfetti32.$$.fragment, local);
    			transition_out(toggleconfetti33.$$.fragment, local);
    			transition_out(toggleconfetti34.$$.fragment, local);
    			transition_out(toggleconfetti35.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div47);
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
    			destroy_component(toggleconfetti18);
    			destroy_component(toggleconfetti19);
    			destroy_component(toggleconfetti20);
    			destroy_component(toggleconfetti21);
    			destroy_component(toggleconfetti22);
    			destroy_component(toggleconfetti23);
    			destroy_component(toggleconfetti24);
    			destroy_component(toggleconfetti25);
    			destroy_component(toggleconfetti26);
    			destroy_component(toggleconfetti27);
    			destroy_component(toggleconfetti28);
    			destroy_component(toggleconfetti29);
    			destroy_component(toggleconfetti30);
    			destroy_component(toggleconfetti31);
    			destroy_component(toggleconfetti32);
    			destroy_component(toggleconfetti33);
    			destroy_component(toggleconfetti34);
    			destroy_component(toggleconfetti35);
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
