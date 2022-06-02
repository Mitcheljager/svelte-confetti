
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
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (30:2) {#each { length: amount } as _}
    function create_each_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "confetti svelte-dmrqjs");
    			set_style(div, "--fall-distance", /*fallDistance*/ ctx[8]);
    			set_style(div, "--size", /*size*/ ctx[0] + "px");
    			set_style(div, "--color", /*getColor*/ ctx[12]());
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

    			add_location(div, file$2, 30, 4, 889);
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
    		source: "(30:2) {#each { length: amount } as _}",
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

    			attr_dev(div, "class", "confetti-holder svelte-dmrqjs");
    			toggle_class(div, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(div, "cone", /*cone*/ ctx[10]);
    			toggle_class(div, "no-gravity", /*noGravity*/ ctx[11]);
    			add_location(div, file$2, 28, 0, 765);
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
    			if (dirty & /*fallDistance, size, getColor, randomBetween, y, x, infinite, duration, delay, iterationCount, amount*/ 4607) {
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

    			if (dirty & /*noGravity*/ 2048) {
    				toggle_class(div, "no-gravity", /*noGravity*/ ctx[11]);
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
    	let { fallDistance = "100px" } = $$props;
    	let { rounded = false } = $$props;
    	let { cone = false } = $$props;
    	let { noGravity = false } = $$props;

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
    		'cone',
    		'noGravity'
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
    		if ('colorRange' in $$props) $$invalidate(13, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(14, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    		if ('noGravity' in $$props) $$invalidate(11, noGravity = $$props.noGravity);
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
    		noGravity,
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
    		if ('colorRange' in $$props) $$invalidate(13, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(14, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    		if ('noGravity' in $$props) $$invalidate(11, noGravity = $$props.noGravity);
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
    		noGravity,
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
    			colorRange: 13,
    			colorArray: 14,
    			amount: 6,
    			iterationCount: 7,
    			fallDistance: 8,
    			rounded: 9,
    			cone: 10,
    			noGravity: 11
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

    	get noGravity() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGravity(value) {
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
    			attr_dev(div, "class", "confetti svelte-5dfw8");
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
    			attr_dev(span, "class", "svelte-5dfw8");
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
    function create_default_slot_64(ctx) {
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
    		id: create_default_slot_64.name,
    		type: "slot",
    		source: "(45:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (46:4) 
    function create_label_slot_64(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 45, 4, 1346);
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
    		id: create_label_slot_64.name,
    		type: "slot",
    		source: "(46:4) ",
    		ctx
    	});

    	return block;
    }

    // (53:3) <ToggleConfetti>
    function create_default_slot_63(ctx) {
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
    		id: create_default_slot_63.name,
    		type: "slot",
    		source: "(53:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (54:4) 
    function create_label_slot_63(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Lots";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 53, 4, 1467);
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
    		id: create_label_slot_63.name,
    		type: "slot",
    		source: "(54:4) ",
    		ctx
    	});

    	return block;
    }

    // (61:3) <ToggleConfetti>
    function create_default_slot_62(ctx) {
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
    		id: create_default_slot_62.name,
    		type: "slot",
    		source: "(61:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (62:4) 
    function create_label_slot_62(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Few";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 61, 4, 1596);
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
    		id: create_label_slot_62.name,
    		type: "slot",
    		source: "(62:4) ",
    		ctx
    	});

    	return block;
    }

    // (69:3) <ToggleConfetti>
    function create_default_slot_61(ctx) {
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
    		id: create_default_slot_61.name,
    		type: "slot",
    		source: "(69:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (70:4) 
    function create_label_slot_61(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Large";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 69, 4, 1723);
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
    		id: create_label_slot_61.name,
    		type: "slot",
    		source: "(70:4) ",
    		ctx
    	});

    	return block;
    }

    // (77:3) <ToggleConfetti>
    function create_default_slot_60(ctx) {
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
    		id: create_default_slot_60.name,
    		type: "slot",
    		source: "(77:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (78:4) 
    function create_label_slot_60(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Rounded";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 77, 4, 1850);
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
    		id: create_label_slot_60.name,
    		type: "slot",
    		source: "(78:4) ",
    		ctx
    	});

    	return block;
    }

    // (85:3) <ToggleConfetti>
    function create_default_slot_59(ctx) {
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
    		id: create_default_slot_59.name,
    		type: "slot",
    		source: "(85:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (86:4) 
    function create_label_slot_59(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Colored";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 85, 4, 1987);
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
    		id: create_label_slot_59.name,
    		type: "slot",
    		source: "(86:4) ",
    		ctx
    	});

    	return block;
    }

    // (93:3) <ToggleConfetti>
    function create_default_slot_58(ctx) {
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
    		id: create_default_slot_58.name,
    		type: "slot",
    		source: "(93:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (94:4) 
    function create_label_slot_58(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Multi Colored";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 93, 4, 2140);
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
    		id: create_label_slot_58.name,
    		type: "slot",
    		source: "(94:4) ",
    		ctx
    	});

    	return block;
    }

    // (101:3) <ToggleConfetti>
    function create_default_slot_57(ctx) {
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
    		id: create_default_slot_57.name,
    		type: "slot",
    		source: "(101:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (102:4) 
    function create_label_slot_57(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Images";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 101, 4, 2317);
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
    		id: create_label_slot_57.name,
    		type: "slot",
    		source: "(102:4) ",
    		ctx
    	});

    	return block;
    }

    // (109:3) <ToggleConfetti>
    function create_default_slot_56(ctx) {
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
    		id: create_default_slot_56.name,
    		type: "slot",
    		source: "(109:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (110:4) 
    function create_label_slot_56(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Gradient";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 109, 4, 2564);
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
    		id: create_label_slot_56.name,
    		type: "slot",
    		source: "(110:4) ",
    		ctx
    	});

    	return block;
    }

    // (117:3) <ToggleConfetti>
    function create_default_slot_55(ctx) {
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
    		id: create_default_slot_55.name,
    		type: "slot",
    		source: "(117:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (118:4) 
    function create_label_slot_55(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Flag";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 117, 4, 2752);
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
    		id: create_label_slot_55.name,
    		type: "slot",
    		source: "(118:4) ",
    		ctx
    	});

    	return block;
    }

    // (127:3) <ToggleConfetti>
    function create_default_slot_54(ctx) {
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
    		id: create_default_slot_54.name,
    		type: "slot",
    		source: "(127:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (128:4) 
    function create_label_slot_54(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Vertical";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 127, 4, 3059);
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
    		id: create_label_slot_54.name,
    		type: "slot",
    		source: "(128:4) ",
    		ctx
    	});

    	return block;
    }

    // (135:3) <ToggleConfetti>
    function create_default_slot_53(ctx) {
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
    		id: create_default_slot_53.name,
    		type: "slot",
    		source: "(135:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (136:4) 
    function create_label_slot_53(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Horizontal";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 135, 4, 3210);
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
    		id: create_label_slot_53.name,
    		type: "slot",
    		source: "(136:4) ",
    		ctx
    	});

    	return block;
    }

    // (143:3) <ToggleConfetti>
    function create_default_slot_52(ctx) {
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
    		id: create_default_slot_52.name,
    		type: "slot",
    		source: "(143:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (144:4) 
    function create_label_slot_52(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 143, 4, 3362);
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
    		id: create_label_slot_52.name,
    		type: "slot",
    		source: "(144:4) ",
    		ctx
    	});

    	return block;
    }

    // (151:3) <ToggleConfetti>
    function create_default_slot_51(ctx) {
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
    		id: create_default_slot_51.name,
    		type: "slot",
    		source: "(151:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (152:4) 
    function create_label_slot_51(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "All around";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 151, 4, 3485);
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
    		id: create_label_slot_51.name,
    		type: "slot",
    		source: "(152:4) ",
    		ctx
    	});

    	return block;
    }

    // (159:3) <ToggleConfetti>
    function create_default_slot_50(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				y: [-1, 1],
    				x: [-1, 1],
    				noGravity: true,
    				duration: "750"
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
    		id: create_default_slot_50.name,
    		type: "slot",
    		source: "(159:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (160:4) 
    function create_label_slot_50(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Explosion";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 159, 4, 3641);
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
    		id: create_label_slot_50.name,
    		type: "slot",
    		source: "(160:4) ",
    		ctx
    	});

    	return block;
    }

    // (167:3) <ToggleConfetti>
    function create_default_slot_49(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				y: [-0.5, 0.5],
    				x: [-0.5, 0.5],
    				colorRange: [30, 50],
    				amount: "20",
    				fallDistance: "0px",
    				duration: "3000",
    				size: "4"
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
    		id: create_default_slot_49.name,
    		type: "slot",
    		source: "(167:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (168:4) 
    function create_label_slot_49(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Sparkles";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 167, 4, 3811);
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
    		id: create_label_slot_49.name,
    		type: "slot",
    		source: "(168:4) ",
    		ctx
    	});

    	return block;
    }

    // (175:3) <ToggleConfetti>
    function create_default_slot_48(ctx) {
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
    		id: create_default_slot_48.name,
    		type: "slot",
    		source: "(175:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (176:4) 
    function create_label_slot_48(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Spray";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 175, 4, 4035);
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
    		id: create_label_slot_48.name,
    		type: "slot",
    		source: "(176:4) ",
    		ctx
    	});

    	return block;
    }

    // (183:3) <ToggleConfetti>
    function create_default_slot_47(ctx) {
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
    		id: create_default_slot_47.name,
    		type: "slot",
    		source: "(183:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (184:4) 
    function create_label_slot_47(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 183, 4, 4171);
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
    		id: create_label_slot_47.name,
    		type: "slot",
    		source: "(184:4) ",
    		ctx
    	});

    	return block;
    }

    // (193:3) <ToggleConfetti toggleOnce>
    function create_default_slot_46(ctx) {
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
    		id: create_default_slot_46.name,
    		type: "slot",
    		source: "(193:3) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (194:4) 
    function create_label_slot_46(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Constant";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 193, 4, 4454);
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
    		id: create_label_slot_46.name,
    		type: "slot",
    		source: "(194:4) ",
    		ctx
    	});

    	return block;
    }

    // (202:3) <ToggleConfetti toggleOnce relative={false}>
    function create_default_slot_45(ctx) {
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
    			add_location(div, file, 206, 4, 4703);
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
    		id: create_default_slot_45.name,
    		type: "slot",
    		source: "(202:3) <ToggleConfetti toggleOnce relative={false}>",
    		ctx
    	});

    	return block;
    }

    // (203:4) 
    function create_label_slot_45(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Fullscreen";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 202, 4, 4642);
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
    		id: create_label_slot_45.name,
    		type: "slot",
    		source: "(203:4) ",
    		ctx
    	});

    	return block;
    }

    // (245:4) <ToggleConfetti>
    function create_default_slot_44(ctx) {
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
    		id: create_default_slot_44.name,
    		type: "slot",
    		source: "(245:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (246:5) 
    function create_label_slot_44(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 245, 5, 5823);
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
    		id: create_label_slot_44.name,
    		type: "slot",
    		source: "(246:5) ",
    		ctx
    	});

    	return block;
    }

    // (267:4) <ToggleConfetti>
    function create_default_slot_43(ctx) {
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
    		id: create_default_slot_43.name,
    		type: "slot",
    		source: "(267:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (268:5) 
    function create_label_slot_43(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 267, 5, 6550);
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
    		id: create_label_slot_43.name,
    		type: "slot",
    		source: "(268:5) ",
    		ctx
    	});

    	return block;
    }

    // (281:4) <ToggleConfetti>
    function create_default_slot_42(ctx) {
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
    		id: create_default_slot_42.name,
    		type: "slot",
    		source: "(281:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (282:5) 
    function create_label_slot_42(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Left";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 281, 5, 6882);
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
    		id: create_label_slot_42.name,
    		type: "slot",
    		source: "(282:5) ",
    		ctx
    	});

    	return block;
    }

    // (295:4) <ToggleConfetti>
    function create_default_slot_41(ctx) {
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
    		id: create_default_slot_41.name,
    		type: "slot",
    		source: "(295:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (296:5) 
    function create_label_slot_41(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Right";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 295, 5, 7209);
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
    		id: create_label_slot_41.name,
    		type: "slot",
    		source: "(296:5) ",
    		ctx
    	});

    	return block;
    }

    // (309:4) <ToggleConfetti>
    function create_default_slot_40(ctx) {
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
    		id: create_default_slot_40.name,
    		type: "slot",
    		source: "(309:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (310:5) 
    function create_label_slot_40(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Up";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 309, 5, 7533);
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
    		id: create_label_slot_40.name,
    		type: "slot",
    		source: "(310:5) ",
    		ctx
    	});

    	return block;
    }

    // (323:4) <ToggleConfetti>
    function create_default_slot_39(ctx) {
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
    		id: create_default_slot_39.name,
    		type: "slot",
    		source: "(323:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (324:5) 
    function create_label_slot_39(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Down";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 323, 5, 7868);
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
    		id: create_label_slot_39.name,
    		type: "slot",
    		source: "(324:5) ",
    		ctx
    	});

    	return block;
    }

    // (337:4) <ToggleConfetti>
    function create_default_slot_38(ctx) {
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
    		id: create_default_slot_38.name,
    		type: "slot",
    		source: "(337:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (338:5) 
    function create_label_slot_38(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Everywhere";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 337, 5, 8211);
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
    		id: create_label_slot_38.name,
    		type: "slot",
    		source: "(338:5) ",
    		ctx
    	});

    	return block;
    }

    // (359:4) <ToggleConfetti>
    function create_default_slot_37(ctx) {
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
    		id: create_default_slot_37.name,
    		type: "slot",
    		source: "(359:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (360:5) 
    function create_label_slot_37(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Few";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 359, 5, 8955);
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
    		id: create_label_slot_37.name,
    		type: "slot",
    		source: "(360:5) ",
    		ctx
    	});

    	return block;
    }

    // (373:4) <ToggleConfetti>
    function create_default_slot_36(ctx) {
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
    		id: create_default_slot_36.name,
    		type: "slot",
    		source: "(373:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (374:5) 
    function create_label_slot_36(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 373, 5, 9210);
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
    		id: create_label_slot_36.name,
    		type: "slot",
    		source: "(374:5) ",
    		ctx
    	});

    	return block;
    }

    // (387:4) <ToggleConfetti>
    function create_default_slot_35(ctx) {
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
    		id: create_default_slot_35.name,
    		type: "slot",
    		source: "(387:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (388:5) 
    function create_label_slot_35(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Lots";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 387, 5, 9469);
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
    		source: "(388:5) ",
    		ctx
    	});

    	return block;
    }

    // (401:4) <ToggleConfetti>
    function create_default_slot_34(ctx) {
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
    		id: create_default_slot_34.name,
    		type: "slot",
    		source: "(401:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (402:5) 
    function create_label_slot_34(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Too many";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 401, 5, 9727);
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
    		source: "(402:5) ",
    		ctx
    	});

    	return block;
    }

    // (423:4) <ToggleConfetti>
    function create_default_slot_33(ctx) {
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
    		id: create_default_slot_33.name,
    		type: "slot",
    		source: "(423:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (424:5) 
    function create_label_slot_33(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 423, 5, 10384);
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
    		source: "(424:5) ",
    		ctx
    	});

    	return block;
    }

    // (437:4) <ToggleConfetti>
    function create_default_slot_32(ctx) {
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
    		id: create_default_slot_32.name,
    		type: "slot",
    		source: "(437:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (438:5) 
    function create_label_slot_32(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 437, 5, 10632);
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
    		source: "(438:5) ",
    		ctx
    	});

    	return block;
    }

    // (453:4) <ToggleConfetti>
    function create_default_slot_31(ctx) {
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
    		id: create_default_slot_31.name,
    		type: "slot",
    		source: "(453:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (454:5) 
    function create_label_slot_31(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Right";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 453, 5, 11014);
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
    		source: "(454:5) ",
    		ctx
    	});

    	return block;
    }

    // (467:4) <ToggleConfetti>
    function create_default_slot_30(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { cone: true, x: [1, 2.5], y: [0.25, 0.75] },
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
    		source: "(467:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (468:5) 
    function create_label_slot_30(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Right Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 467, 5, 11312);
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
    		source: "(468:5) ",
    		ctx
    	});

    	return block;
    }

    // (491:4) <ToggleConfetti>
    function create_default_slot_29(ctx) {
    	let confetti;
    	let current;
    	confetti = new Confetti({ props: { size: "2" }, $$inline: true });

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
    		source: "(491:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (492:5) 
    function create_label_slot_29(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Tiny";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 491, 5, 11951);
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
    		source: "(492:5) ",
    		ctx
    	});

    	return block;
    }

    // (505:4) <ToggleConfetti>
    function create_default_slot_28(ctx) {
    	let confetti;
    	let current;
    	confetti = new Confetti({ props: { size: "30" }, $$inline: true });

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
    		source: "(505:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (506:5) 
    function create_label_slot_28(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Huge";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 505, 5, 12201);
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
    		source: "(506:5) ",
    		ctx
    	});

    	return block;
    }

    // (521:4) <ToggleConfetti>
    function create_default_slot_27(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { rounded: true, size: "30" },
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
    		source: "(521:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (522:5) 
    function create_label_slot_27(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Round";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 521, 5, 12551);
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
    		source: "(522:5) ",
    		ctx
    	});

    	return block;
    }

    // (543:4) <ToggleConfetti>
    function create_default_slot_26(ctx) {
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
    		id: create_default_slot_26.name,
    		type: "slot",
    		source: "(543:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (544:5) 
    function create_label_slot_26(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Short delay";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 543, 5, 13207);
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
    		source: "(544:5) ",
    		ctx
    	});

    	return block;
    }

    // (557:4) <ToggleConfetti>
    function create_default_slot_25(ctx) {
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
    		id: create_default_slot_25.name,
    		type: "slot",
    		source: "(557:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (558:5) 
    function create_label_slot_25(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Long delay";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 557, 5, 13494);
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
    		source: "(558:5) ",
    		ctx
    	});

    	return block;
    }

    // (573:4) <ToggleConfetti toggleOnce>
    function create_default_slot_24(ctx) {
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
    		id: create_default_slot_24.name,
    		type: "slot",
    		source: "(573:4) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (574:5) 
    function create_label_slot_24(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 573, 5, 14028);
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
    		source: "(574:5) ",
    		ctx
    	});

    	return block;
    }

    // (587:4) <ToggleConfetti toggleOnce>
    function create_default_slot_23(ctx) {
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
    		id: create_default_slot_23.name,
    		type: "slot",
    		source: "(587:4) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (588:5) 
    function create_label_slot_23(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Long delay";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 587, 5, 14296);
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
    		source: "(588:5) ",
    		ctx
    	});

    	return block;
    }

    // (603:4) <ToggleConfetti toggleOnce>
    function create_default_slot_22(ctx) {
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
    		id: create_default_slot_22.name,
    		type: "slot",
    		source: "(603:4) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (604:5) 
    function create_label_slot_22(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Infinite";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 603, 5, 15025);
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
    		source: "(604:5) ",
    		ctx
    	});

    	return block;
    }

    // (625:4) <ToggleConfetti>
    function create_default_slot_21(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { colorRange: [75, 175] },
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
    		source: "(625:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (626:5) 
    function create_label_slot_21(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Green range";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 625, 5, 15864);
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
    		source: "(626:5) ",
    		ctx
    	});

    	return block;
    }

    // (639:4) <ToggleConfetti>
    function create_default_slot_20(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				colorArray: ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]
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
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(639:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (640:5) 
    function create_label_slot_20(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Array";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 639, 5, 16163);
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
    		source: "(640:5) ",
    		ctx
    	});

    	return block;
    }

    // (653:4) <ToggleConfetti>
    function create_default_slot_19(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				colorArray: ["var(--primary)", "rgba(0, 255, 0, 0.5)", "white"]
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
    		source: "(653:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (654:5) 
    function create_label_slot_19(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Different values";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 653, 5, 16548);
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
    		source: "(654:5) ",
    		ctx
    	});

    	return block;
    }

    // (669:4) <ToggleConfetti>
    function create_default_slot_18(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				size: "20",
    				colorArray: ["linear-gradient(var(--primary), blue)"]
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
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(669:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (670:5) 
    function create_label_slot_18(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Gradient";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 669, 5, 17068);
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
    		source: "(670:5) ",
    		ctx
    	});

    	return block;
    }

    // (683:4) <ToggleConfetti>
    function create_default_slot_17(ctx) {
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
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(683:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (684:5) 
    function create_label_slot_17(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Images";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 683, 5, 17436);
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
    		source: "(684:5) ",
    		ctx
    	});

    	return block;
    }

    // (699:4) <ToggleConfetti>
    function create_default_slot_16(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				colorArray: [`hsl(${Math.floor(Math.random() * 360)}, 75%, 50%)`]
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
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(699:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (700:5) 
    function create_label_slot_16(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Random";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 699, 5, 18006);
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
    		source: "(700:5) ",
    		ctx
    	});

    	return block;
    }

    // (721:4) <ToggleConfetti>
    function create_default_slot_15(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { fallDistance: "50px" },
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
    		source: "(721:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (722:5) 
    function create_label_slot_15(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Slow fall";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 721, 5, 18713);
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
    		source: "(722:5) ",
    		ctx
    	});

    	return block;
    }

    // (735:4) <ToggleConfetti>
    function create_default_slot_14(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { fallDistance: "200px" },
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
    		source: "(735:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (736:5) 
    function create_label_slot_14(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Fast fall";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 735, 5, 18990);
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
    		source: "(736:5) ",
    		ctx
    	});

    	return block;
    }

    // (749:4) <ToggleConfetti>
    function create_default_slot_13(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { fallDistance: "0px" },
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
    		source: "(749:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (750:5) 
    function create_label_slot_13(ctx) {
    	let div;
    	let button;
    	let t1;
    	let small;
    	let t2;
    	let code0;
    	let t4;
    	let code1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "No fall";
    			t1 = space();
    			small = element("small");
    			t2 = text("Notice how it's set to ");
    			code0 = element("code");
    			code0.textContent = "0px";
    			t4 = text(" and not just ");
    			code1 = element("code");
    			code1.textContent = "0";
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 750, 6, 19295);
    			attr_dev(code0, "class", "inline svelte-1lhfouh");
    			add_location(code0, file, 754, 36, 19376);
    			attr_dev(code1, "class", "inline svelte-1lhfouh");
    			add_location(code1, file, 754, 81, 19421);
    			add_location(small, file, 754, 6, 19346);
    			attr_dev(div, "slot", "label");
    			add_location(div, file, 749, 5, 19269);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, small);
    			append_dev(small, t2);
    			append_dev(small, code0);
    			append_dev(small, t4);
    			append_dev(small, code1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_13.name,
    		type: "slot",
    		source: "(750:5) ",
    		ctx
    	});

    	return block;
    }

    // (769:4) <ToggleConfetti>
    function create_default_slot_12(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { noGravity: true, duration: "500" },
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
    		source: "(769:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (770:5) 
    function create_label_slot_12(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "No gravity";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 769, 5, 19843);
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
    		source: "(770:5) ",
    		ctx
    	});

    	return block;
    }

    // (783:4) <ToggleConfetti>
    function create_default_slot_11(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: {
    				noGravity: true,
    				duration: "500",
    				x: [-0.5, 0.5],
    				y: [-0.5, 0.5]
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
    		source: "(783:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (784:5) 
    function create_label_slot_11(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "No gravity explosion";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 783, 5, 20131);
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
    		source: "(784:5) ",
    		ctx
    	});

    	return block;
    }

    // (806:4) <ToggleConfetti>
    function create_default_slot_10(ctx) {
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
    				colorArray: ["#3350ec"]
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
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(806:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (807:5) 
    function create_label_slot_10(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Dutch";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 806, 5, 20919);
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
    		source: "(807:5) ",
    		ctx
    	});

    	return block;
    }

    // (832:4) <ToggleConfetti>
    function create_default_slot_9(ctx) {
    	let confetti0;
    	let t0;
    	let confetti1;
    	let t1;
    	let confetti2;
    	let current;

    	confetti0 = new Confetti({
    			props: {
    				y: [0.75, 1.5],
    				x: [-1, 1],
    				colorArray: ["#3350ec"],
    				amount: "100"
    			},
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				y: [1.05, 1.20],
    				x: [-1, 1],
    				colorArray: ["#ffcd00"],
    				amount: "50"
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				y: [0.75, 1.5],
    				x: [-0.5, -0.25],
    				colorArray: ["#ffcd00"],
    				amount: "20"
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
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(832:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (833:5) 
    function create_label_slot_9(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Swedish";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 832, 5, 21715);
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
    		source: "(833:5) ",
    		ctx
    	});

    	return block;
    }

    // (858:4) <ToggleConfetti>
    function create_default_slot_8(ctx) {
    	let confetti0;
    	let t0;
    	let confetti1;
    	let t1;
    	let confetti2;
    	let t2;
    	let confetti3;
    	let t3;
    	let confetti4;
    	let t4;
    	let confetti5;
    	let t5;
    	let confetti6;
    	let t6;
    	let confetti7;
    	let t7;
    	let confetti8;
    	let t8;
    	let confetti9;
    	let t9;
    	let confetti10;
    	let t10;
    	let confetti11;
    	let t11;
    	let confetti12;
    	let t12;
    	let confetti13;
    	let t13;
    	let confetti14;
    	let current;

    	confetti0 = new Confetti({
    			props: {
    				y: [1.15, 1.5],
    				x: [-1, -0.25],
    				colorArray: ["#3350ec"],
    				amount: "100"
    			},
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				y: [1.20, 1.45],
    				x: [-0.95, -0.3],
    				colorArray: ["white"],
    				size: "5"
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				y: [1.45, 1.5],
    				x: [-0.25, 1],
    				colorArray: ["#bf0d3e"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti3 = new Confetti({
    			props: {
    				y: [1.4, 1.45],
    				x: [-0.25, 1],
    				colorArray: ["white"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti4 = new Confetti({
    			props: {
    				y: [1.35, 1.4],
    				x: [-0.25, 1],
    				colorArray: ["#bf0d3e"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti5 = new Confetti({
    			props: {
    				y: [1.3, 1.35],
    				x: [-0.25, 1],
    				colorArray: ["white"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti6 = new Confetti({
    			props: {
    				y: [1.25, 1.3],
    				x: [-0.25, 1],
    				colorArray: ["#bf0d3e"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti7 = new Confetti({
    			props: {
    				y: [1.2, 1.25],
    				x: [-0.25, 1],
    				colorArray: ["white"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti8 = new Confetti({
    			props: {
    				y: [1.15, 1.2],
    				x: [-0.25, 1],
    				colorArray: ["#bf0d3e"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti9 = new Confetti({
    			props: {
    				y: [1.1, 1.15],
    				x: [-1, 1],
    				colorArray: ["white"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti10 = new Confetti({
    			props: {
    				y: [1.05, 1.1],
    				x: [-1, 1],
    				colorArray: ["#bf0d3e"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti11 = new Confetti({
    			props: {
    				y: [1, 1.05],
    				x: [-1, 1],
    				colorArray: ["white"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti12 = new Confetti({
    			props: {
    				y: [0.95, 1],
    				x: [-1, 1],
    				colorArray: ["#bf0d3e"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti13 = new Confetti({
    			props: {
    				y: [0.9, 0.95],
    				x: [-1, 1],
    				colorArray: ["white"],
    				amount: "70"
    			},
    			$$inline: true
    		});

    	confetti14 = new Confetti({
    			props: {
    				y: [0.85, 0.9],
    				x: [-1, 1],
    				colorArray: ["#bf0d3e"],
    				amount: "70"
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
    			t2 = space();
    			create_component(confetti3.$$.fragment);
    			t3 = space();
    			create_component(confetti4.$$.fragment);
    			t4 = space();
    			create_component(confetti5.$$.fragment);
    			t5 = space();
    			create_component(confetti6.$$.fragment);
    			t6 = space();
    			create_component(confetti7.$$.fragment);
    			t7 = space();
    			create_component(confetti8.$$.fragment);
    			t8 = space();
    			create_component(confetti9.$$.fragment);
    			t9 = space();
    			create_component(confetti10.$$.fragment);
    			t10 = space();
    			create_component(confetti11.$$.fragment);
    			t11 = space();
    			create_component(confetti12.$$.fragment);
    			t12 = space();
    			create_component(confetti13.$$.fragment);
    			t13 = space();
    			create_component(confetti14.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(confetti1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(confetti2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(confetti3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(confetti4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(confetti5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(confetti6, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(confetti7, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(confetti8, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(confetti9, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(confetti10, target, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(confetti11, target, anchor);
    			insert_dev(target, t11, anchor);
    			mount_component(confetti12, target, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(confetti13, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(confetti14, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti0.$$.fragment, local);
    			transition_in(confetti1.$$.fragment, local);
    			transition_in(confetti2.$$.fragment, local);
    			transition_in(confetti3.$$.fragment, local);
    			transition_in(confetti4.$$.fragment, local);
    			transition_in(confetti5.$$.fragment, local);
    			transition_in(confetti6.$$.fragment, local);
    			transition_in(confetti7.$$.fragment, local);
    			transition_in(confetti8.$$.fragment, local);
    			transition_in(confetti9.$$.fragment, local);
    			transition_in(confetti10.$$.fragment, local);
    			transition_in(confetti11.$$.fragment, local);
    			transition_in(confetti12.$$.fragment, local);
    			transition_in(confetti13.$$.fragment, local);
    			transition_in(confetti14.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti0.$$.fragment, local);
    			transition_out(confetti1.$$.fragment, local);
    			transition_out(confetti2.$$.fragment, local);
    			transition_out(confetti3.$$.fragment, local);
    			transition_out(confetti4.$$.fragment, local);
    			transition_out(confetti5.$$.fragment, local);
    			transition_out(confetti6.$$.fragment, local);
    			transition_out(confetti7.$$.fragment, local);
    			transition_out(confetti8.$$.fragment, local);
    			transition_out(confetti9.$$.fragment, local);
    			transition_out(confetti10.$$.fragment, local);
    			transition_out(confetti11.$$.fragment, local);
    			transition_out(confetti12.$$.fragment, local);
    			transition_out(confetti13.$$.fragment, local);
    			transition_out(confetti14.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(confetti1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(confetti2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(confetti3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(confetti4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(confetti5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(confetti6, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(confetti7, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(confetti8, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(confetti9, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(confetti10, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_component(confetti11, detaching);
    			if (detaching) detach_dev(t11);
    			destroy_component(confetti12, detaching);
    			if (detaching) detach_dev(t12);
    			destroy_component(confetti13, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(confetti14, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(858:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (859:5) 
    function create_label_slot_8(ctx) {
    	let div;
    	let button;
    	let t1;
    	let small;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "USA";
    			t1 = space();
    			small = element("small");
    			small.textContent = "This one is heavy! This uses 1015 effects, more than recommended, but it looks neat!";
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 859, 6, 22625);
    			add_location(small, file, 863, 6, 22672);
    			attr_dev(div, "slot", "label");
    			add_location(div, file, 858, 5, 22599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, small);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_8.name,
    		type: "slot",
    		source: "(859:5) ",
    		ctx
    	});

    	return block;
    }

    // (936:4) <ToggleConfetti>
    function create_default_slot_7(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { amount: "70", x: [-0.5, 0.5] },
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
    		source: "(936:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (937:5) 
    function create_label_slot_7(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Not feathered";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 936, 5, 26640);
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
    		source: "(937:5) ",
    		ctx
    	});

    	return block;
    }

    // (952:4) <ToggleConfetti>
    function create_default_slot_6(ctx) {
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
    				x: [-0.75, -0.3],
    				y: [0.15, 0.75]
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				amount: "10",
    				x: [0.3, 0.75],
    				y: [0.15, 0.75]
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
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(952:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (953:5) 
    function create_label_slot_6(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 952, 5, 27007);
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
    		source: "(953:5) ",
    		ctx
    	});

    	return block;
    }

    // (978:4) <ToggleConfetti>
    function create_default_slot_5(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { cone: true, amount: "70", x: [-0.5, 0.5] },
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
    		source: "(978:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (979:5) 
    function create_label_slot_5(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 978, 5, 27696);
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
    		source: "(979:5) ",
    		ctx
    	});

    	return block;
    }

    // (994:4) <ToggleConfetti>
    function create_default_slot_4(ctx) {
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
    				x: [-0.75, -0.4],
    				y: [0.15, 0.75]
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				cone: true,
    				amount: "10",
    				x: [0.4, 0.75],
    				y: [0.15, 0.75]
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
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(994:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (995:5) 
    function create_label_slot_4(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 994, 5, 28017);
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
    		source: "(995:5) ",
    		ctx
    	});

    	return block;
    }

    // (1020:4) <ToggleConfetti>
    function create_default_slot_3(ctx) {
    	let confetti0;
    	let t0;
    	let confetti1;
    	let t1;
    	let confetti2;
    	let current;

    	confetti0 = new Confetti({
    			props: { x: [-0.5, 0.5], delay: [0, 250] },
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				amount: "10",
    				x: [-0.75, -0.3],
    				y: [0.15, 0.75],
    				delay: [0, 1000]
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				amount: "10",
    				x: [0.3, 0.75],
    				y: [0.15, 0.75],
    				delay: [0, 1000]
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
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(1020:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (1021:5) 
    function create_label_slot_3(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered and delayed";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 1020, 5, 28821);
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
    		source: "(1021:5) ",
    		ctx
    	});

    	return block;
    }

    // (1046:4) <ToggleConfetti>
    function create_default_slot_2(ctx) {
    	let confetti0;
    	let t0;
    	let confetti1;
    	let t1;
    	let confetti2;
    	let t2;
    	let confetti3;
    	let current;

    	confetti0 = new Confetti({
    			props: {
    				cone: true,
    				x: [-1, -0.25],
    				colorRange: [100, 200]
    			},
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				cone: true,
    				x: [-0.35, 0.35],
    				delay: [500, 550],
    				colorRange: [200, 300]
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				cone: true,
    				x: [0.25, 1],
    				delay: [250, 300],
    				colorRange: [100, 200]
    			},
    			$$inline: true
    		});

    	confetti3 = new Confetti({
    			props: {
    				cone: true,
    				amount: "20",
    				x: [-1, 1],
    				y: [0, 1],
    				delay: [0, 550],
    				colorRange: [200, 300]
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
    			t2 = space();
    			create_component(confetti3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confetti0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(confetti1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(confetti2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(confetti3, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti0.$$.fragment, local);
    			transition_in(confetti1.$$.fragment, local);
    			transition_in(confetti2.$$.fragment, local);
    			transition_in(confetti3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti0.$$.fragment, local);
    			transition_out(confetti1.$$.fragment, local);
    			transition_out(confetti2.$$.fragment, local);
    			transition_out(confetti3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confetti0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(confetti1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(confetti2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(confetti3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(1046:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (1047:5) 
    function create_label_slot_2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Animate";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 1046, 5, 29695);
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
    		source: "(1047:5) ",
    		ctx
    	});

    	return block;
    }

    // (1074:4) <ToggleConfetti>
    function create_default_slot_1(ctx) {
    	let confetti0;
    	let t0;
    	let confetti1;
    	let t1;
    	let confetti2;
    	let current;

    	confetti0 = new Confetti({
    			props: {
    				noGravity: true,
    				x: [-1, 1],
    				y: [-1, 1],
    				delay: [0, 50],
    				duration: "1000",
    				colorRange: [0, 120]
    			},
    			$$inline: true
    		});

    	confetti1 = new Confetti({
    			props: {
    				noGravity: true,
    				x: [-1, 1],
    				y: [-1, 1],
    				delay: [550, 550],
    				duration: "1000",
    				colorRange: [120, 240]
    			},
    			$$inline: true
    		});

    	confetti2 = new Confetti({
    			props: {
    				noGravity: true,
    				x: [-1, 1],
    				y: [-1, 1],
    				delay: [1000, 1050],
    				duration: "1000",
    				colorRange: [240, 360]
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(1074:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (1075:5) 
    function create_label_slot_1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Animate explosion";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 1074, 5, 30787);
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
    		source: "(1075:5) ",
    		ctx
    	});

    	return block;
    }

    // (1106:4) <ToggleConfetti toggleOnce relative={false}>
    function create_default_slot(ctx) {
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
    			add_location(div, file, 1110, 5, 32307);
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
    		source: "(1106:4) <ToggleConfetti toggleOnce relative={false}>",
    		ctx
    	});

    	return block;
    }

    // (1107:5) 
    function create_label_slot(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Fullscreen";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 1106, 5, 32243);
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
    		source: "(1107:5) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div97;
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
    	let toggleconfetti18;
    	let t34;
    	let toggleconfetti19;
    	let t35;
    	let h21;
    	let t37;
    	let p3;
    	let t39;
    	let code0;
    	let t40;
    	let mark1;
    	let t42;
    	let code1;
    	let t43;
    	let mark2;
    	let t45;
    	let p4;
    	let t47;
    	let code2;
    	let t48;
    	let mark3;
    	let t50;
    	let mark4;
    	let t52;
    	let t53;
    	let code3;
    	let t54;
    	let mark5;
    	let t56;
    	let t57;
    	let h22;
    	let t59;
    	let mark6;
    	let t61;
    	let div6;
    	let div5;
    	let t62;
    	let div4;
    	let toggleconfetti20;
    	let t63;
    	let code4;
    	let t65;
    	let div14;
    	let h30;
    	let t67;
    	let div13;
    	let t68;
    	let mark7;
    	let t70;
    	let mark8;
    	let t72;
    	let div7;
    	let toggleconfetti21;
    	let t73;
    	let code5;
    	let t74;
    	let mark9;
    	let t76;
    	let mark10;
    	let t78;
    	let t79;
    	let div8;
    	let toggleconfetti22;
    	let t80;
    	let code6;
    	let t81;
    	let mark11;
    	let t83;
    	let mark12;
    	let t85;
    	let t86;
    	let div9;
    	let toggleconfetti23;
    	let t87;
    	let code7;
    	let t88;
    	let mark13;
    	let t90;
    	let mark14;
    	let t92;
    	let t93;
    	let div10;
    	let toggleconfetti24;
    	let t94;
    	let code8;
    	let t95;
    	let mark15;
    	let t97;
    	let mark16;
    	let t99;
    	let t100;
    	let div11;
    	let toggleconfetti25;
    	let t101;
    	let code9;
    	let t102;
    	let mark17;
    	let t104;
    	let mark18;
    	let t106;
    	let t107;
    	let div12;
    	let toggleconfetti26;
    	let t108;
    	let code10;
    	let t109;
    	let mark19;
    	let t111;
    	let mark20;
    	let t113;
    	let t114;
    	let div20;
    	let h31;
    	let t116;
    	let div19;
    	let t117;
    	let mark21;
    	let t119;
    	let div15;
    	let toggleconfetti27;
    	let t120;
    	let code11;
    	let t121;
    	let mark22;
    	let t123;
    	let t124;
    	let div16;
    	let toggleconfetti28;
    	let t125;
    	let code12;
    	let t126;
    	let mark23;
    	let t128;
    	let t129;
    	let div17;
    	let toggleconfetti29;
    	let t130;
    	let code13;
    	let t131;
    	let mark24;
    	let t133;
    	let t134;
    	let div18;
    	let toggleconfetti30;
    	let t135;
    	let code14;
    	let t136;
    	let mark25;
    	let t138;
    	let t139;
    	let div26;
    	let h32;
    	let t141;
    	let div25;
    	let t142;
    	let mark26;
    	let t144;
    	let div21;
    	let toggleconfetti31;
    	let t145;
    	let code15;
    	let t147;
    	let div22;
    	let toggleconfetti32;
    	let t148;
    	let code16;
    	let t149;
    	let mark27;
    	let t151;
    	let t152;
    	let div23;
    	let toggleconfetti33;
    	let t153;
    	let code17;
    	let t155;
    	let div24;
    	let toggleconfetti34;
    	let t156;
    	let code18;
    	let t157;
    	let mark28;
    	let t159;
    	let t160;
    	let t161;
    	let div31;
    	let h33;
    	let t163;
    	let div30;
    	let t164;
    	let mark29;
    	let t166;
    	let div27;
    	let toggleconfetti35;
    	let t167;
    	let code19;
    	let t168;
    	let mark30;
    	let t170;
    	let t171;
    	let div28;
    	let toggleconfetti36;
    	let t172;
    	let code20;
    	let t173;
    	let mark31;
    	let t175;
    	let t176;
    	let mark32;
    	let t178;
    	let div29;
    	let toggleconfetti37;
    	let t179;
    	let code21;
    	let t180;
    	let mark33;
    	let t182;
    	let t183;
    	let div38;
    	let h34;
    	let t185;
    	let div37;
    	let t186;
    	let mark34;
    	let t188;
    	let div32;
    	let toggleconfetti38;
    	let t189;
    	let code22;
    	let t190;
    	let mark35;
    	let t192;
    	let t193;
    	let div33;
    	let toggleconfetti39;
    	let t194;
    	let code23;
    	let t195;
    	let mark36;
    	let t197;
    	let t198;
    	let mark37;
    	let t200;
    	let div34;
    	let toggleconfetti40;
    	let t201;
    	let code24;
    	let t202;
    	let mark38;
    	let t204;
    	let t205;
    	let div35;
    	let toggleconfetti41;
    	let t206;
    	let code25;
    	let t207;
    	let mark39;
    	let t209;
    	let mark40;
    	let t211;
    	let t212;
    	let mark41;
    	let t214;
    	let div36;
    	let toggleconfetti42;
    	let t215;
    	let code26;
    	let t216;
    	let mark42;
    	let t218;
    	let t219;
    	let div46;
    	let h35;
    	let t221;
    	let div45;
    	let t222;
    	let mark43;
    	let t224;
    	let mark44;
    	let t226;
    	let div39;
    	let toggleconfetti43;
    	let t227;
    	let code27;
    	let t228;
    	let mark45;
    	let t230;
    	let t231;
    	let div40;
    	let toggleconfetti44;
    	let t232;
    	let code28;
    	let t233;
    	let mark46;
    	let t235;
    	let t236;
    	let div41;
    	let toggleconfetti45;
    	let t237;
    	let code29;
    	let t238;
    	let mark47;
    	let t240;
    	let t241;
    	let div42;
    	let toggleconfetti46;
    	let t242;
    	let code30;
    	let t243;
    	let mark48;
    	let t245;
    	let t246;
    	let div43;
    	let toggleconfetti47;
    	let t247;
    	let code31;
    	let t248;
    	let mark49;
    	let t250;
    	let t251;
    	let div44;
    	let toggleconfetti48;
    	let t252;
    	let code32;
    	let t253;
    	let mark50;
    	let t255;
    	let t256;
    	let div53;
    	let h36;
    	let t258;
    	let div52;
    	let t259;
    	let mark51;
    	let t261;
    	let div47;
    	let toggleconfetti49;
    	let t262;
    	let code33;
    	let t263;
    	let mark52;
    	let t265;
    	let t266;
    	let div48;
    	let toggleconfetti50;
    	let t267;
    	let code34;
    	let t268;
    	let mark53;
    	let t270;
    	let t271;
    	let div49;
    	let toggleconfetti51;
    	let t272;
    	let code35;
    	let t273;
    	let mark54;
    	let t275;
    	let t276;
    	let mark55;
    	let t278;
    	let div50;
    	let toggleconfetti52;
    	let t279;
    	let code36;
    	let t280;
    	let mark56;
    	let t282;
    	let t283;
    	let div51;
    	let toggleconfetti53;
    	let t284;
    	let code37;
    	let t285;
    	let mark57;
    	let t287;
    	let t288;
    	let div75;
    	let h37;
    	let t290;
    	let div74;
    	let t291;
    	let br0;
    	let t292;
    	let small;
    	let t294;
    	let div55;
    	let toggleconfetti54;
    	let t295;
    	let div54;
    	let code38;
    	let t297;
    	let code39;
    	let t299;
    	let code40;
    	let t301;
    	let div57;
    	let toggleconfetti55;
    	let t302;
    	let div56;
    	let code41;
    	let t304;
    	let code42;
    	let t306;
    	let code43;
    	let t308;
    	let div59;
    	let toggleconfetti56;
    	let t309;
    	let div58;
    	let code44;
    	let t311;
    	let code45;
    	let t313;
    	let code46;
    	let t315;
    	let code47;
    	let t317;
    	let code48;
    	let t319;
    	let code49;
    	let t321;
    	let code50;
    	let t323;
    	let code51;
    	let t325;
    	let code52;
    	let t327;
    	let code53;
    	let t329;
    	let code54;
    	let t331;
    	let code55;
    	let t333;
    	let code56;
    	let t335;
    	let code57;
    	let t337;
    	let code58;
    	let t339;
    	let div61;
    	let toggleconfetti57;
    	let t340;
    	let div60;
    	let code59;
    	let t342;
    	let div63;
    	let toggleconfetti58;
    	let t343;
    	let div62;
    	let code60;
    	let t345;
    	let code61;
    	let t347;
    	let code62;
    	let t349;
    	let div65;
    	let toggleconfetti59;
    	let t350;
    	let div64;
    	let code63;
    	let t352;
    	let div67;
    	let toggleconfetti60;
    	let t353;
    	let div66;
    	let code64;
    	let t355;
    	let code65;
    	let t357;
    	let code66;
    	let t359;
    	let div69;
    	let toggleconfetti61;
    	let t360;
    	let div68;
    	let code67;
    	let t362;
    	let code68;
    	let t364;
    	let code69;
    	let t366;
    	let div71;
    	let toggleconfetti62;
    	let t367;
    	let div70;
    	let code70;
    	let t369;
    	let code71;
    	let t371;
    	let code72;
    	let t373;
    	let code73;
    	let t375;
    	let div73;
    	let toggleconfetti63;
    	let t376;
    	let div72;
    	let code74;
    	let t378;
    	let code75;
    	let t380;
    	let code76;
    	let t382;
    	let div79;
    	let h38;
    	let t384;
    	let div78;
    	let t385;
    	let div77;
    	let toggleconfetti64;
    	let t386;
    	let div76;
    	let code77;
    	let t387;
    	let br1;
    	let t388;
    	let br2;
    	let t389;
    	let br3;
    	let t390;
    	let br4;
    	let t391;
    	let br5;
    	let t392;
    	let br6;
    	let t393;
    	let br7;
    	let t394;
    	let br8;
    	let t395;
    	let br9;
    	let t396;
    	let br10;
    	let t397;
    	let t398;
    	let mark58;
    	let t400;
    	let code78;
    	let t402;
    	let br11;
    	let t403;
    	let br12;
    	let t404;
    	let code79;
    	let t406;
    	let code80;
    	let t408;
    	let t409;
    	let h23;
    	let t411;
    	let div95;
    	let p5;
    	let t413;
    	let div94;
    	let strong0;
    	let t415;
    	let strong1;
    	let t417;
    	let strong2;
    	let t419;
    	let code81;
    	let t421;
    	let code82;
    	let t423;
    	let div80;
    	let t425;
    	let code83;
    	let t427;
    	let code84;
    	let t429;
    	let div81;
    	let t431;
    	let code85;
    	let t433;
    	let code86;
    	let t435;
    	let div82;
    	let t437;
    	let code87;
    	let t439;
    	let code88;
    	let t441;
    	let div83;
    	let t443;
    	let code89;
    	let t445;
    	let code90;
    	let t447;
    	let div84;
    	let t449;
    	let code91;
    	let t451;
    	let code92;
    	let t453;
    	let div85;
    	let t455;
    	let code93;
    	let t457;
    	let code94;
    	let t459;
    	let div86;
    	let t461;
    	let code95;
    	let t463;
    	let code96;
    	let t465;
    	let div87;
    	let t467;
    	let code97;
    	let t469;
    	let code98;
    	let t471;
    	let div88;
    	let t473;
    	let code99;
    	let t475;
    	let code100;
    	let t477;
    	let div89;
    	let t479;
    	let code101;
    	let t481;
    	let code102;
    	let t483;
    	let div90;
    	let t485;
    	let code103;
    	let t487;
    	let code104;
    	let t489;
    	let div91;
    	let t491;
    	let code105;
    	let t493;
    	let code106;
    	let t495;
    	let div92;
    	let t497;
    	let code107;
    	let t499;
    	let code108;
    	let t501;
    	let div93;
    	let t503;
    	let div96;
    	let t504;
    	let a1;
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
    					label: [create_label_slot_64],
    					default: [create_default_slot_64]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti1 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_63],
    					default: [create_default_slot_63]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti2 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_62],
    					default: [create_default_slot_62]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti3 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_61],
    					default: [create_default_slot_61]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti4 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_60],
    					default: [create_default_slot_60]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti5 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_59],
    					default: [create_default_slot_59]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti6 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_58],
    					default: [create_default_slot_58]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti7 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_57],
    					default: [create_default_slot_57]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti8 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_56],
    					default: [create_default_slot_56]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti9 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_55],
    					default: [create_default_slot_55]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti10 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_54],
    					default: [create_default_slot_54]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti11 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_53],
    					default: [create_default_slot_53]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti12 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_52],
    					default: [create_default_slot_52]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti13 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_51],
    					default: [create_default_slot_51]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti14 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_50],
    					default: [create_default_slot_50]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti15 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_49],
    					default: [create_default_slot_49]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti16 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_48],
    					default: [create_default_slot_48]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti17 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_47],
    					default: [create_default_slot_47]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti18 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_46],
    					default: [create_default_slot_46]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti19 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				relative: false,
    				$$slots: {
    					label: [create_label_slot_45],
    					default: [create_default_slot_45]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti20 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_44],
    					default: [create_default_slot_44]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti21 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_43],
    					default: [create_default_slot_43]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti22 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_42],
    					default: [create_default_slot_42]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti23 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_41],
    					default: [create_default_slot_41]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti24 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_40],
    					default: [create_default_slot_40]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti25 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_39],
    					default: [create_default_slot_39]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti26 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_38],
    					default: [create_default_slot_38]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti27 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_37],
    					default: [create_default_slot_37]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti28 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_36],
    					default: [create_default_slot_36]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti29 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_35],
    					default: [create_default_slot_35]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti30 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_34],
    					default: [create_default_slot_34]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti31 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_33],
    					default: [create_default_slot_33]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti32 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_32],
    					default: [create_default_slot_32]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti33 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_31],
    					default: [create_default_slot_31]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti34 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_30],
    					default: [create_default_slot_30]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti35 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_29],
    					default: [create_default_slot_29]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti36 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_28],
    					default: [create_default_slot_28]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti37 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_27],
    					default: [create_default_slot_27]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti38 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_26],
    					default: [create_default_slot_26]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti39 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_25],
    					default: [create_default_slot_25]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti40 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_24],
    					default: [create_default_slot_24]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti41 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_23],
    					default: [create_default_slot_23]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti42 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_22],
    					default: [create_default_slot_22]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti43 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_21],
    					default: [create_default_slot_21]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti44 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_20],
    					default: [create_default_slot_20]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti45 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_19],
    					default: [create_default_slot_19]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti46 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_18],
    					default: [create_default_slot_18]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti47 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_17],
    					default: [create_default_slot_17]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti48 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_16],
    					default: [create_default_slot_16]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti49 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_15],
    					default: [create_default_slot_15]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti50 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_14],
    					default: [create_default_slot_14]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti51 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_13],
    					default: [create_default_slot_13]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti52 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_12],
    					default: [create_default_slot_12]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti53 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_11],
    					default: [create_default_slot_11]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti54 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_10],
    					default: [create_default_slot_10]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti55 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_9],
    					default: [create_default_slot_9]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti56 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_8],
    					default: [create_default_slot_8]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti57 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_7],
    					default: [create_default_slot_7]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti58 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_6],
    					default: [create_default_slot_6]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti59 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_5],
    					default: [create_default_slot_5]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti60 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_4],
    					default: [create_default_slot_4]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti61 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_3],
    					default: [create_default_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti62 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_2],
    					default: [create_default_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti63 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_1],
    					default: [create_default_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti64 = new ToggleConfetti({
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
    			div97 = element("div");
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
    			create_component(toggleconfetti18.$$.fragment);
    			t34 = space();
    			create_component(toggleconfetti19.$$.fragment);
    			t35 = space();
    			h21 = element("h2");
    			h21.textContent = "Installation";
    			t37 = space();
    			p3 = element("p");
    			p3.textContent = "Install using Yarn or NPM.";
    			t39 = space();
    			code0 = element("code");
    			t40 = text("yarn add ");
    			mark1 = element("mark");
    			mark1.textContent = "svelte-confetti";
    			t42 = space();
    			code1 = element("code");
    			t43 = text("npm install --save ");
    			mark2 = element("mark");
    			mark2.textContent = "svelte-confetti";
    			t45 = space();
    			p4 = element("p");
    			p4.textContent = "Include the component in your app.";
    			t47 = space();
    			code2 = element("code");
    			t48 = text("import { ");
    			mark3 = element("mark");
    			mark3.textContent = "Confetti";
    			t50 = text(" } from \"");
    			mark4 = element("mark");
    			mark4.textContent = "svelte-confetti";
    			t52 = text("\"");
    			t53 = space();
    			code3 = element("code");
    			t54 = text("<");
    			mark5 = element("mark");
    			mark5.textContent = "Confetti";
    			t56 = text(" />");
    			t57 = space();
    			h22 = element("h2");
    			h22.textContent = "Usage";
    			t59 = space();
    			mark6 = element("mark");
    			mark6.textContent = "The Confetti comes without the buttons you will see in these examples. The buttons are simply used to demonstrate the effect in these docs.";
    			t61 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t62 = text("The component in it's most basic form.\r\n\r\n\t\t\t");
    			div4 = element("div");
    			create_component(toggleconfetti20.$$.fragment);
    			t63 = space();
    			code4 = element("code");
    			code4.textContent = "<Confetti />";
    			t65 = space();
    			div14 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Spread";
    			t67 = space();
    			div13 = element("div");
    			t68 = text("The spread of confetti can be adjusted. The props ");
    			mark7 = element("mark");
    			mark7.textContent = "x";
    			t70 = text(" and ");
    			mark8 = element("mark");
    			mark8.textContent = "y";
    			t72 = text(" are used to determine how far the confetti spreads. For both values multipliers are used and these are to be supplied in an array of two with the lowest number first. For each confetti piece a random number between these two is picked. The higher the number the futher the spread. Negative numbers affect the direction.\r\n\r\n\t\t\t");
    			div7 = element("div");
    			create_component(toggleconfetti21.$$.fragment);
    			t73 = space();
    			code5 = element("code");
    			t74 = text("<Confetti ");
    			mark9 = element("mark");
    			mark9.textContent = "x";
    			t76 = text("={[-0.5, 0.5]} ");
    			mark10 = element("mark");
    			mark10.textContent = "y";
    			t78 = text("={[0.25, 1]} />");
    			t79 = space();
    			div8 = element("div");
    			create_component(toggleconfetti22.$$.fragment);
    			t80 = space();
    			code6 = element("code");
    			t81 = text("<Confetti ");
    			mark11 = element("mark");
    			mark11.textContent = "x";
    			t83 = text("={[-1, -0.25]} ");
    			mark12 = element("mark");
    			mark12.textContent = "y";
    			t85 = text("={[0, 0.5]} />");
    			t86 = space();
    			div9 = element("div");
    			create_component(toggleconfetti23.$$.fragment);
    			t87 = space();
    			code7 = element("code");
    			t88 = text("<Confetti ");
    			mark13 = element("mark");
    			mark13.textContent = "x";
    			t90 = text("={[0.25, 1]} ");
    			mark14 = element("mark");
    			mark14.textContent = "y";
    			t92 = text("={[0, 0.5]} />");
    			t93 = space();
    			div10 = element("div");
    			create_component(toggleconfetti24.$$.fragment);
    			t94 = space();
    			code8 = element("code");
    			t95 = text("<Confetti ");
    			mark15 = element("mark");
    			mark15.textContent = "x";
    			t97 = text("={[-0.25, 0.25]} ");
    			mark16 = element("mark");
    			mark16.textContent = "y";
    			t99 = text("={[0.75, 1.5]} />");
    			t100 = space();
    			div11 = element("div");
    			create_component(toggleconfetti25.$$.fragment);
    			t101 = space();
    			code9 = element("code");
    			t102 = text("<Confetti ");
    			mark17 = element("mark");
    			mark17.textContent = "x";
    			t104 = text("={[-0.25, 0.25]} ");
    			mark18 = element("mark");
    			mark18.textContent = "y";
    			t106 = text("={[-0.75, -0.25]} />");
    			t107 = space();
    			div12 = element("div");
    			create_component(toggleconfetti26.$$.fragment);
    			t108 = space();
    			code10 = element("code");
    			t109 = text("<Confetti ");
    			mark19 = element("mark");
    			mark19.textContent = "x";
    			t111 = text("={[-0.5, 0.5]} ");
    			mark20 = element("mark");
    			mark20.textContent = "y";
    			t113 = text("={[-0.5, -0.5]} />");
    			t114 = space();
    			div20 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Amount";
    			t116 = space();
    			div19 = element("div");
    			t117 = text("The amount of particles that are launched can be adjusted with the ");
    			mark21 = element("mark");
    			mark21.textContent = "amount";
    			t119 = text(" property. This should always be a whole number. Be careful with going too high as it may impact performance. It will depends on the device and other performance heavy elements on the page, but try and keep it below 500.\r\n\r\n\t\t\t");
    			div15 = element("div");
    			create_component(toggleconfetti27.$$.fragment);
    			t120 = space();
    			code11 = element("code");
    			t121 = text("<Confetti ");
    			mark22 = element("mark");
    			mark22.textContent = "amount";
    			t123 = text("=10 />");
    			t124 = space();
    			div16 = element("div");
    			create_component(toggleconfetti28.$$.fragment);
    			t125 = space();
    			code12 = element("code");
    			t126 = text("<Confetti ");
    			mark23 = element("mark");
    			mark23.textContent = "amount";
    			t128 = text("=50 />");
    			t129 = space();
    			div17 = element("div");
    			create_component(toggleconfetti29.$$.fragment);
    			t130 = space();
    			code13 = element("code");
    			t131 = text("<Confetti ");
    			mark24 = element("mark");
    			mark24.textContent = "amount";
    			t133 = text("=200 />");
    			t134 = space();
    			div18 = element("div");
    			create_component(toggleconfetti30.$$.fragment);
    			t135 = space();
    			code14 = element("code");
    			t136 = text("<Confetti ");
    			mark25 = element("mark");
    			mark25.textContent = "amount";
    			t138 = text("=500 />");
    			t139 = space();
    			div26 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Shape";
    			t141 = space();
    			div25 = element("div");
    			t142 = text("As you may have noticed from the previous buttons, the confetti tends to take on a fairly square shape. This can be mitigated a little bit by using the propery ");
    			mark26 = element("mark");
    			mark26.textContent = "cone";
    			t144 = text(". This will cause the confetti to launch in a more cone like shape which is especially nice when using lots of particles.\r\n\r\n\t\t\t");
    			div21 = element("div");
    			create_component(toggleconfetti31.$$.fragment);
    			t145 = space();
    			code15 = element("code");
    			code15.textContent = "<Confetti amount=200 />";
    			t147 = space();
    			div22 = element("div");
    			create_component(toggleconfetti32.$$.fragment);
    			t148 = space();
    			code16 = element("code");
    			t149 = text("<Confetti ");
    			mark27 = element("mark");
    			mark27.textContent = "cone";
    			t151 = text(" amount=200 />");
    			t152 = text("\r\n\r\n\t\t\tThis is especially effective when firing to the side, but we need to compensate with a larger x multiplier.\r\n\r\n\t\t\t");
    			div23 = element("div");
    			create_component(toggleconfetti33.$$.fragment);
    			t153 = space();
    			code17 = element("code");
    			code17.textContent = "<Confetti x={[0.25, 1]} y={[0, 0.5]} />";
    			t155 = space();
    			div24 = element("div");
    			create_component(toggleconfetti34.$$.fragment);
    			t156 = space();
    			code18 = element("code");
    			t157 = text("<Confetti ");
    			mark28 = element("mark");
    			mark28.textContent = "cone";
    			t159 = text(" x={[1, 2.5]} y={[0.25, 0.75]} />");
    			t160 = text("\r\n\r\n\t\t\tThe cones still have a fairly distinct cone shape to them, later on in these docs we will go over how to mitigate this.");
    			t161 = space();
    			div31 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Size";
    			t163 = space();
    			div30 = element("div");
    			t164 = text("The size of the confetti pieces can be adjusted using the ");
    			mark29 = element("mark");
    			mark29.textContent = "size";
    			t166 = text(" property.\r\n\r\n\t\t\t");
    			div27 = element("div");
    			create_component(toggleconfetti35.$$.fragment);
    			t167 = space();
    			code19 = element("code");
    			t168 = text("<Confetti ");
    			mark30 = element("mark");
    			mark30.textContent = "size";
    			t170 = text("=2 />");
    			t171 = space();
    			div28 = element("div");
    			create_component(toggleconfetti36.$$.fragment);
    			t172 = space();
    			code20 = element("code");
    			t173 = text("<Confetti ");
    			mark31 = element("mark");
    			mark31.textContent = "size";
    			t175 = text("=30 />");
    			t176 = text("\r\n\r\n\t\t\tWe can also adjust the shape of the confetti pieces using the ");
    			mark32 = element("mark");
    			mark32.textContent = "rounded";
    			t178 = text(" property\r\n\r\n\t\t\t");
    			div29 = element("div");
    			create_component(toggleconfetti37.$$.fragment);
    			t179 = space();
    			code21 = element("code");
    			t180 = text("<Confetti ");
    			mark33 = element("mark");
    			mark33.textContent = "rounded";
    			t182 = text(" size=30 />");
    			t183 = space();
    			div38 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Timing";
    			t185 = space();
    			div37 = element("div");
    			t186 = text("By default all confetti comes out at just about the same time. There is a little bit of variance but it appears instant. That's what a confetti cannon does. We can change when each piece is fired by adjusted the range of the ");
    			mark34 = element("mark");
    			mark34.textContent = "delay";
    			t188 = text(" property. The delay is given in milliseconds.\r\n\r\n\t\t\t");
    			div32 = element("div");
    			create_component(toggleconfetti38.$$.fragment);
    			t189 = space();
    			code22 = element("code");
    			t190 = text("<Confetti ");
    			mark35 = element("mark");
    			mark35.textContent = "delay";
    			t192 = text("={[0, 250]} />");
    			t193 = space();
    			div33 = element("div");
    			create_component(toggleconfetti39.$$.fragment);
    			t194 = space();
    			code23 = element("code");
    			t195 = text("<Confetti ");
    			mark36 = element("mark");
    			mark36.textContent = "delay";
    			t197 = text("={[0, 1500]} />");
    			t198 = text("\r\n\r\n\t\t\tWe can also opt to have the animation play infinitely by setting the ");
    			mark37 = element("mark");
    			mark37.textContent = "infinite";
    			t200 = text(" property, at this point the delay mostly has a effect only when spawning in for the first time. (Click the button again to toggle it off)\r\n\r\n\t\t\t");
    			div34 = element("div");
    			create_component(toggleconfetti40.$$.fragment);
    			t201 = space();
    			code24 = element("code");
    			t202 = text("<Confetti ");
    			mark38 = element("mark");
    			mark38.textContent = "infinite";
    			t204 = text(" />");
    			t205 = space();
    			div35 = element("div");
    			create_component(toggleconfetti41.$$.fragment);
    			t206 = space();
    			code25 = element("code");
    			t207 = text("<Confetti ");
    			mark39 = element("mark");
    			mark39.textContent = "infinite";
    			t209 = space();
    			mark40 = element("mark");
    			mark40.textContent = "delay";
    			t211 = text("={[0, 1500]} />");
    			t212 = text("\r\n\r\n\t\t\tAlternatively we can let the animation play out fully before repeating. For this we can use the ");
    			mark41 = element("mark");
    			mark41.textContent = "iterationCount";
    			t214 = text(" property. This is especially useful during development to tweak the confetti without having to reload the page or set up a button. This can be set to a number or to \"infinite\", basically anything that would be accepted by the animation-iteration-count property in CSS.\r\n\r\n\t\t\t");
    			div36 = element("div");
    			create_component(toggleconfetti42.$$.fragment);
    			t215 = space();
    			code26 = element("code");
    			t216 = text("<Confetti ");
    			mark42 = element("mark");
    			mark42.textContent = "iterationCount";
    			t218 = text("=infinite />");
    			t219 = space();
    			div46 = element("div");
    			h35 = element("h3");
    			h35.textContent = "Color";
    			t221 = space();
    			div45 = element("div");
    			t222 = text("You can adjust the colors of the confetti pieces in different ways. You can specify a hue using the ");
    			mark43 = element("mark");
    			mark43.textContent = "colorRange";
    			t224 = text(" property, which will use HSL colors with 75% saturation and 50% lightness. 0-360 is all colors, 75-175 would be only greens. Alternatively you can specifiy colors in an array using ");
    			mark44 = element("mark");
    			mark44.textContent = "colorArray";
    			t226 = text(". This can take any CSS value that would be accepted as the background property. RGB, HEX, HSL, but even gradients and images.\r\n\r\n\t\t\t");
    			div39 = element("div");
    			create_component(toggleconfetti43.$$.fragment);
    			t227 = space();
    			code27 = element("code");
    			t228 = text("<Confetti ");
    			mark45 = element("mark");
    			mark45.textContent = "colorRange";
    			t230 = text("={[75, 175]} />");
    			t231 = space();
    			div40 = element("div");
    			create_component(toggleconfetti44.$$.fragment);
    			t232 = space();
    			code28 = element("code");
    			t233 = text("<Confetti ");
    			mark46 = element("mark");
    			mark46.textContent = "colorArray";
    			t235 = text("={[\"#ffbe0b\", \"#fb5607\", \"#ff006e\", \"#8338ec\", \"#3a86ff\"]} />");
    			t236 = space();
    			div41 = element("div");
    			create_component(toggleconfetti45.$$.fragment);
    			t237 = space();
    			code29 = element("code");
    			t238 = text("<Confetti ");
    			mark47 = element("mark");
    			mark47.textContent = "colorArray";
    			t240 = text("={[\"var(--primary)\", \"rgba(0, 255, 0, 0.5)\", \"white\"]} />");
    			t241 = text("\r\n\r\n\t\t\tIt's not just colors though, we can input any value valid to the background css property. This includes gradients and images.\r\n\r\n\t\t\t");
    			div42 = element("div");
    			create_component(toggleconfetti46.$$.fragment);
    			t242 = space();
    			code30 = element("code");
    			t243 = text("<Confetti ");
    			mark48 = element("mark");
    			mark48.textContent = "colorArray";
    			t245 = text("={[\"linear-gradient(var(--primary), blue)\"]} />");
    			t246 = space();
    			div43 = element("div");
    			create_component(toggleconfetti47.$$.fragment);
    			t247 = space();
    			code31 = element("code");
    			t248 = text("<Confetti ");
    			mark49 = element("mark");
    			mark49.textContent = "colorArray";
    			t250 = text("={[\"url(https://svelte.dev/favicon.png)\", \"url(https://github.githubassets.com/favicons/favicon-dark.png)\"]} />");
    			t251 = text("\r\n\r\n\t\t\tOr we could set up a random color each time the component is mounted.\r\n\r\n\t\t\t");
    			div44 = element("div");
    			create_component(toggleconfetti48.$$.fragment);
    			t252 = space();
    			code32 = element("code");
    			t253 = text("<Confetti ");
    			mark50 = element("mark");
    			mark50.textContent = "colorArray";
    			t255 = text("={[`hsl(${Math.floor(Math.random() * 360)}, 75%, 50%)`]} />");
    			t256 = space();
    			div53 = element("div");
    			h36 = element("h3");
    			h36.textContent = "Gravity";
    			t258 = space();
    			div52 = element("div");
    			t259 = text("We can change how the confetti falls using the ");
    			mark51 = element("mark");
    			mark51.textContent = "fallDistance";
    			t261 = text(" property. We can make it fall faster, slow, or stop it from falling altogether. This property will accept any valid css property, except for 0.\r\n\r\n\t\t\t");
    			div47 = element("div");
    			create_component(toggleconfetti49.$$.fragment);
    			t262 = space();
    			code33 = element("code");
    			t263 = text("<Confetti ");
    			mark52 = element("mark");
    			mark52.textContent = "fallDistance";
    			t265 = text("=50px />");
    			t266 = space();
    			div48 = element("div");
    			create_component(toggleconfetti50.$$.fragment);
    			t267 = space();
    			code34 = element("code");
    			t268 = text("<Confetti ");
    			mark53 = element("mark");
    			mark53.textContent = "fallDistance";
    			t270 = text("=200px />");
    			t271 = space();
    			div49 = element("div");
    			create_component(toggleconfetti51.$$.fragment);
    			t272 = space();
    			code35 = element("code");
    			t273 = text("<Confetti ");
    			mark54 = element("mark");
    			mark54.textContent = "fallDistance";
    			t275 = text("=0px />");
    			t276 = text("\r\n\r\n\t\t\tWe can also disable gravity and air resistance altogether and make it travel at a constant speed by setting the ");
    			mark55 = element("mark");
    			mark55.textContent = "noGravity";
    			t278 = text(" property.\r\n\r\n\t\t\t");
    			div50 = element("div");
    			create_component(toggleconfetti52.$$.fragment);
    			t279 = space();
    			code36 = element("code");
    			t280 = text("<Confetti ");
    			mark56 = element("mark");
    			mark56.textContent = "noGravity";
    			t282 = text(" duration=500 />");
    			t283 = space();
    			div51 = element("div");
    			create_component(toggleconfetti53.$$.fragment);
    			t284 = space();
    			code37 = element("code");
    			t285 = text("<Confetti ");
    			mark57 = element("mark");
    			mark57.textContent = "noGravity";
    			t287 = text(" duration=500 x={[-0.5, 0.5]} y={[-0.5, 0.5]} />");
    			t288 = space();
    			div75 = element("div");
    			h37 = element("h3");
    			h37.textContent = "Multiple components";
    			t290 = space();
    			div74 = element("div");
    			t291 = text("We can combine multiple Confetti components to create neat effects.");
    			br0 = element("br");
    			t292 = text("\r\n\t\t\tFor example we could combine multiple components each with different colors and different areas to create flags! ");
    			small = element("small");
    			small.textContent = "(Blues aren't the actual flag colors to make it a little easier to see on dark backgrounds)";
    			t294 = space();
    			div55 = element("div");
    			create_component(toggleconfetti54.$$.fragment);
    			t295 = space();
    			div54 = element("div");
    			code38 = element("code");
    			code38.textContent = "<Confetti y={[1.25, 1.5]} x={[-1, 1]} colorArray={[\"#c8102e\"]} />";
    			t297 = space();
    			code39 = element("code");
    			code39.textContent = "<Confetti  y={[1, 1.25]} x={[-1, 1]} colorArray={[\"white\"]} />";
    			t299 = space();
    			code40 = element("code");
    			code40.textContent = "<Confetti  y={[0.75, 1]} x={[-1, 1]} colorArray={[\"#3350ec\"]} />";
    			t301 = space();
    			div57 = element("div");
    			create_component(toggleconfetti55.$$.fragment);
    			t302 = space();
    			div56 = element("div");
    			code41 = element("code");
    			code41.textContent = "<Confetti y={[0.75, 1.5]} x={[-1, 1]} colorArray={[\"#004b87\"]} amount=100 />";
    			t304 = space();
    			code42 = element("code");
    			code42.textContent = "<Confetti y={[1.05, 1.20]} x={[-1, 1]} colorArray={[\"#ffcd00\"]} amount=50 />";
    			t306 = space();
    			code43 = element("code");
    			code43.textContent = "<Confetti y={[0.75, 1.5]} x={[-0.5, -0.25]} colorArray={[\"#ffcd00\"]} amount=20 />";
    			t308 = space();
    			div59 = element("div");
    			create_component(toggleconfetti56.$$.fragment);
    			t309 = space();
    			div58 = element("div");
    			code44 = element("code");
    			code44.textContent = "<Confetti y={[1.15, 1.5]} x={[-1, -0.25]} colorArray={[\"#3350ec\"]} amount=100 />";
    			t311 = space();
    			code45 = element("code");
    			code45.textContent = "<Confetti y={[1.20, 1.45]} x={[-0.95, -0.3]} colorArray={[\"white\"]} size=5 />";
    			t313 = space();
    			code46 = element("code");
    			code46.textContent = "<Confetti y={[1.45, 1.5]} x={[-0.25, 1]} colorArray={[\"#bf0d3e\"]} amount=70 />";
    			t315 = space();
    			code47 = element("code");
    			code47.textContent = "<Confetti y={[1.4, 1.45]} x={[-0.25, 1]} colorArray={[\"white\"]} amount=70 />";
    			t317 = space();
    			code48 = element("code");
    			code48.textContent = "<Confetti y={[1.35, 1.4]} x={[-0.25, 1]} colorArray={[\"#bf0d3e\"]} amount=70 />";
    			t319 = space();
    			code49 = element("code");
    			code49.textContent = "<Confetti y={[1.3, 1.35]} x={[-0.25, 1]} colorArray={[\"white\"]} amount=70 />";
    			t321 = space();
    			code50 = element("code");
    			code50.textContent = "<Confetti y={[1.25, 1.3]} x={[-0.25, 1]} colorArray={[\"#bf0d3e\"]} amount=70 />";
    			t323 = space();
    			code51 = element("code");
    			code51.textContent = "<Confetti y={[1.2, 1.25]} x={[-0.25, 1]} colorArray={[\"white\"]} amount=70 />";
    			t325 = space();
    			code52 = element("code");
    			code52.textContent = "<Confetti y={[1.15, 1.2]} x={[-0.25, 1]} colorArray={[\"#bf0d3e\"]} amount=70 />";
    			t327 = space();
    			code53 = element("code");
    			code53.textContent = "<Confetti y={[1.1, 1.15]} x={[-1, 1]} colorArray={[\"white\"]} amount=70 />";
    			t329 = space();
    			code54 = element("code");
    			code54.textContent = "<Confetti y={[1.05, 1.1]} x={[-1, 1]} colorArray={[\"#bf0d3e\"]} amount=70 />";
    			t331 = space();
    			code55 = element("code");
    			code55.textContent = "<Confetti y={[1, 1.05]} x={[-1, 1]} colorArray={[\"white\"]} amount=70 />";
    			t333 = space();
    			code56 = element("code");
    			code56.textContent = "<Confetti y={[0.95, 1]} x={[-1, 1]} colorArray={[\"#bf0d3e\"]} amount=70 />";
    			t335 = space();
    			code57 = element("code");
    			code57.textContent = "<Confetti y={[0.9, 0.95]} x={[-1, 1]} colorArray={[\"white\"]} amount=70 />";
    			t337 = space();
    			code58 = element("code");
    			code58.textContent = "<Confetti y={[0.85, 0.9]} x={[-1, 1]} colorArray={[\"#bf0d3e\"]} amount=70 />";
    			t339 = text("\r\n\r\n\t\t\tFlags are cool, but we can do plenty of other things. In this example we will \"feather\" the initial effect to give it a less defined shape. By default the effects have a fairly distinct shape to them which ruins the effect a little bit, especially when using lots of particles.\r\n\r\n\t\t\t");
    			div61 = element("div");
    			create_component(toggleconfetti57.$$.fragment);
    			t340 = space();
    			div60 = element("div");
    			code59 = element("code");
    			code59.textContent = "<Confetti y={[1.25, 1.5]} x={[-1, 1]} colorArray={[\"#c8102e\"]} />";
    			t342 = space();
    			div63 = element("div");
    			create_component(toggleconfetti58.$$.fragment);
    			t343 = space();
    			div62 = element("div");
    			code60 = element("code");
    			code60.textContent = "<Confetti x={[-0.5, 0.5]} />";
    			t345 = space();
    			code61 = element("code");
    			code61.textContent = "<Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} />";
    			t347 = space();
    			code62 = element("code");
    			code62.textContent = "<Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} />";
    			t349 = text("\r\n\r\n\t\t\tAnd with the cone property\r\n\r\n\t\t\t");
    			div65 = element("div");
    			create_component(toggleconfetti59.$$.fragment);
    			t350 = space();
    			div64 = element("div");
    			code63 = element("code");
    			code63.textContent = "<Confetti cone amount=70 x={[-0.5, 0.5]} />";
    			t352 = space();
    			div67 = element("div");
    			create_component(toggleconfetti60.$$.fragment);
    			t353 = space();
    			div66 = element("div");
    			code64 = element("code");
    			code64.textContent = "<Confetti cone x={[-0.5, 0.5]} />";
    			t355 = space();
    			code65 = element("code");
    			code65.textContent = "<Confetti cone amount=10 x={[-0.75, -0.4]} y={[0.15, 0.75]} />";
    			t357 = space();
    			code66 = element("code");
    			code66.textContent = "<Confetti cone amount=10 x={[0.4, 0.75]} y={[0.15, 0.75]} />";
    			t359 = text("\r\n\r\n\t\t\tWe can also combine this with a large delay to mitigate the effect further, but it makes it less cannon-y.\r\n\r\n\t\t\t");
    			div69 = element("div");
    			create_component(toggleconfetti61.$$.fragment);
    			t360 = space();
    			div68 = element("div");
    			code67 = element("code");
    			code67.textContent = "<Confetti x={[-0.5, 0.5]} delay={[0, 250]} />";
    			t362 = space();
    			code68 = element("code");
    			code68.textContent = "<Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} delay={[0, 1000]} />";
    			t364 = space();
    			code69 = element("code");
    			code69.textContent = "<Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} delay={[0, 1000]} />";
    			t366 = text("\r\n\r\n\t\t\tWe could also combine multiple components to create animations.\r\n\r\n\t\t\t");
    			div71 = element("div");
    			create_component(toggleconfetti62.$$.fragment);
    			t367 = space();
    			div70 = element("div");
    			code70 = element("code");
    			code70.textContent = "<Confetti cone x={[-1, -0.25]} colorRange={[100, 200]} />";
    			t369 = space();
    			code71 = element("code");
    			code71.textContent = "<Confetti cone x={[-0.35, 0.35]} delay={[500, 550]} colorRange={[200, 300]} />";
    			t371 = space();
    			code72 = element("code");
    			code72.textContent = "<Confetti cone x={[0.25, 1]} delay={[250, 300]} colorRange={[100, 200]} />";
    			t373 = space();
    			code73 = element("code");
    			code73.textContent = "<Confetti cone amount=20 x={[-1, 1]} y={[0, 1]} delay={[0, 550]} colorRange={[200, 300]} />";
    			t375 = space();
    			div73 = element("div");
    			create_component(toggleconfetti63.$$.fragment);
    			t376 = space();
    			div72 = element("div");
    			code74 = element("code");
    			code74.textContent = "<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[0, 50]} duration=1000 colorRange={[0, 120]} />";
    			t378 = space();
    			code75 = element("code");
    			code75.textContent = "<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[550, 550]} duration=1000 colorRange={[120, 240]} />";
    			t380 = space();
    			code76 = element("code");
    			code76.textContent = "<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[1000, 1050]} duration=1000 colorRange={[240, 360]} />";
    			t382 = space();
    			div79 = element("div");
    			h38 = element("h3");
    			h38.textContent = "Styling it further";
    			t384 = space();
    			div78 = element("div");
    			t385 = text("We've now looked at all the different properties, but since this is just HTML and CSS you can style it further however you like. Let's look at some fullscreen examples. Having the effect fullscreen is not a simple toggle, but it is a simple bit of CSS.\r\n\r\n\t\t\t");
    			div77 = element("div");
    			create_component(toggleconfetti64.$$.fragment);
    			t386 = space();
    			div76 = element("div");
    			code77 = element("code");
    			t387 = text("<div style=\"");
    			br1 = element("br");
    			t388 = text("\r\n\t\t\t\t\t\t\tposition: fixed;");
    			br2 = element("br");
    			t389 = text("\r\n\t\t\t\t\t\t\ttop: -50px;");
    			br3 = element("br");
    			t390 = text("\r\n\t\t\t\t\t\t\tleft: 0;");
    			br4 = element("br");
    			t391 = text("\r\n\t\t\t\t\t\t\theight: 100vh;");
    			br5 = element("br");
    			t392 = text("\r\n\t\t\t\t\t\t\twidth: 100vw;");
    			br6 = element("br");
    			t393 = text("\r\n\t\t\t\t\t\t\tdisplay: flex;");
    			br7 = element("br");
    			t394 = text("\r\n\t\t\t\t\t\t\tjustify-content: center;");
    			br8 = element("br");
    			t395 = text("\r\n\t\t\t\t\t\t\toverflow: hidden;\">");
    			br9 = element("br");
    			t396 = text("\r\n\t\t\t\t\t\t\t<Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration=5000 amount=200 fallDistance=\"100vh\" />\r\n\t\t\t\t\t\t\t");
    			br10 = element("br");
    			t397 = text("\r\n\t\t\t\t\t\t</div>");
    			t398 = text("\r\n\r\n\t\t\tThe element is fixed and placed just off screen so we can't see the confetti spawn in. The ");
    			mark58 = element("mark");
    			mark58.textContent = "fallDistance";
    			t400 = text(" property is set to ");
    			code78 = element("code");
    			code78.textContent = "100vh";
    			t402 = text(" so they cover the entire screen.\r\n\t\t\t");
    			br11 = element("br");
    			t403 = space();
    			br12 = element("br");
    			t404 = text("\r\n\t\t\tYou could also further style the confetti itself. Don't like the animation? Do it yourself! Target the confetti with ");
    			code79 = element("code");
    			code79.textContent = ":global(.confetti)";
    			t406 = text(" and change the animation using ");
    			code80 = element("code");
    			code80.textContent = "animation-name";
    			t408 = text(", all values are set as css variables so you can easily use them yourself.");
    			t409 = space();
    			h23 = element("h2");
    			h23.textContent = "Properties";
    			t411 = space();
    			div95 = element("div");
    			p5 = element("p");
    			p5.textContent = "This is a list of all configurable properties.";
    			t413 = space();
    			div94 = element("div");
    			strong0 = element("strong");
    			strong0.textContent = "Property";
    			t415 = space();
    			strong1 = element("strong");
    			strong1.textContent = "Default";
    			t417 = space();
    			strong2 = element("strong");
    			strong2.textContent = "Description";
    			t419 = space();
    			code81 = element("code");
    			code81.textContent = "size";
    			t421 = space();
    			code82 = element("code");
    			code82.textContent = "10";
    			t423 = space();
    			div80 = element("div");
    			div80.textContent = "The max size in pixels of the individual confetti pieces.";
    			t425 = space();
    			code83 = element("code");
    			code83.textContent = "x";
    			t427 = space();
    			code84 = element("code");
    			code84.textContent = "[-0.5, 0.5]";
    			t429 = space();
    			div81 = element("div");
    			div81.textContent = "The max horizontal range of the confetti pieces. Negative is left, positive is right. [-1, 1] would mean maximum of 200px left and 200px right.";
    			t431 = space();
    			code85 = element("code");
    			code85.textContent = "y";
    			t433 = space();
    			code86 = element("code");
    			code86.textContent = "[0.25, 1]";
    			t435 = space();
    			div82 = element("div");
    			div82.textContent = "The max vertical range of the confetti pieces. Negative is down, positive is ip. [-1, 1] would mean maximum of 200px down and 200px up.";
    			t437 = space();
    			code87 = element("code");
    			code87.textContent = "duration";
    			t439 = space();
    			code88 = element("code");
    			code88.textContent = "2000";
    			t441 = space();
    			div83 = element("div");
    			div83.textContent = "Duration of the animation for each individual piece.";
    			t443 = space();
    			code89 = element("code");
    			code89.textContent = "infinite";
    			t445 = space();
    			code90 = element("code");
    			code90.textContent = "false";
    			t447 = space();
    			div84 = element("div");
    			div84.textContent = "If set to true the animation will play indefinitely.";
    			t449 = space();
    			code91 = element("code");
    			code91.textContent = "delay";
    			t451 = space();
    			code92 = element("code");
    			code92.textContent = "[0, 50]";
    			t453 = space();
    			div85 = element("div");
    			div85.textContent = "Used to set a random delay for each piece. A large difference between each number will mean a longer spray time.";
    			t455 = space();
    			code93 = element("code");
    			code93.textContent = "colorRange";
    			t457 = space();
    			code94 = element("code");
    			code94.textContent = "[0, 360]";
    			t459 = space();
    			div86 = element("div");
    			div86.textContent = "Color range on the HSL color wheel. 0 to 360 is full RGB. 75 To 150 would be only green colors.";
    			t461 = space();
    			code95 = element("code");
    			code95.textContent = "colorArray";
    			t463 = space();
    			code96 = element("code");
    			code96.textContent = "[]";
    			t465 = space();
    			div87 = element("div");
    			div87.textContent = "Can be used to pick a random color from this array. Set just one array elements to have a single color. Accepts any viable css background property, including gradients and images.";
    			t467 = space();
    			code97 = element("code");
    			code97.textContent = "amount";
    			t469 = space();
    			code98 = element("code");
    			code98.textContent = "50";
    			t471 = space();
    			div88 = element("div");
    			div88.textContent = "Amount of particles spawned. The larger your spray the more pieces you might want. Be careful with too many as it might impact performance.";
    			t473 = space();
    			code99 = element("code");
    			code99.textContent = "iterationCount";
    			t475 = space();
    			code100 = element("code");
    			code100.textContent = "1";
    			t477 = space();
    			div89 = element("div");
    			div89.textContent = "How many times the animation will play before stopping. Is overwritten by the \"infinite\" property.";
    			t479 = space();
    			code101 = element("code");
    			code101.textContent = "fallDistance";
    			t481 = space();
    			code102 = element("code");
    			code102.textContent = "\"100px\"";
    			t483 = space();
    			div90 = element("div");
    			div90.textContent = "How far each piece falls. Accepts any css property, px, rem, vh, etc, but not 0.";
    			t485 = space();
    			code103 = element("code");
    			code103.textContent = "rounded";
    			t487 = space();
    			code104 = element("code");
    			code104.textContent = "false";
    			t489 = space();
    			div91 = element("div");
    			div91.textContent = "Set to true to make each confetti piece rounded.";
    			t491 = space();
    			code105 = element("code");
    			code105.textContent = "cone";
    			t493 = space();
    			code106 = element("code");
    			code106.textContent = "false";
    			t495 = space();
    			div92 = element("div");
    			div92.textContent = "Set to true to make the explosion appear in a cone like shape which might feel more realistic when dealing with a larger amount.";
    			t497 = space();
    			code107 = element("code");
    			code107.textContent = "noGravity";
    			t499 = space();
    			code108 = element("code");
    			code108.textContent = "false";
    			t501 = space();
    			div93 = element("div");
    			div93.textContent = "Set to true to make the particles accelerate at a constant speed without \"falling\" down. Give it a more explosion like effect.";
    			t503 = space();
    			div96 = element("div");
    			t504 = text("Made by ");
    			a1 = element("a");
    			a1.textContent = "Mitchel Jager";
    			attr_dev(mark0, "class", "svelte-1lhfouh");
    			add_location(mark0, file, 18, 3, 340);
    			attr_dev(h1, "class", "svelte-1lhfouh");
    			add_location(h1, file, 9, 2, 175);
    			attr_dev(div0, "class", "header svelte-1lhfouh");
    			add_location(div0, file, 8, 1, 151);
    			add_location(em, file, 31, 190, 752);
    			attr_dev(p0, "class", "svelte-1lhfouh");
    			add_location(p0, file, 31, 2, 564);
    			attr_dev(div1, "class", "reduced-motion-only svelte-1lhfouh");
    			add_location(div1, file, 33, 2, 806);
    			attr_dev(a0, "href", "https://github.com/Mitcheljager/svelte-confetti");
    			attr_dev(a0, "class", "svelte-1lhfouh");
    			add_location(a0, file, 37, 5, 983);
    			attr_dev(p1, "class", "svelte-1lhfouh");
    			add_location(p1, file, 37, 2, 980);
    			attr_dev(h20, "class", "svelte-1lhfouh");
    			add_location(h20, file, 39, 2, 1061);
    			attr_dev(p2, "class", "svelte-1lhfouh");
    			add_location(p2, file, 41, 2, 1080);
    			attr_dev(div2, "class", "buttons svelte-1lhfouh");
    			add_location(div2, file, 43, 2, 1298);
    			attr_dev(h21, "class", "svelte-1lhfouh");
    			add_location(h21, file, 212, 2, 5011);
    			attr_dev(p3, "class", "svelte-1lhfouh");
    			add_location(p3, file, 214, 2, 5038);
    			attr_dev(mark1, "class", "svelte-1lhfouh");
    			add_location(mark1, file, 217, 12, 5110);
    			attr_dev(code0, "class", "well svelte-1lhfouh");
    			add_location(code0, file, 216, 2, 5077);
    			attr_dev(mark2, "class", "svelte-1lhfouh");
    			add_location(mark2, file, 221, 22, 5198);
    			attr_dev(code1, "class", "well svelte-1lhfouh");
    			add_location(code1, file, 220, 2, 5155);
    			attr_dev(p4, "class", "svelte-1lhfouh");
    			add_location(p4, file, 224, 2, 5243);
    			attr_dev(mark3, "class", "svelte-1lhfouh");
    			add_location(mark3, file, 227, 17, 5328);
    			attr_dev(mark4, "class", "svelte-1lhfouh");
    			add_location(mark4, file, 227, 52, 5363);
    			attr_dev(code2, "class", "well svelte-1lhfouh");
    			add_location(code2, file, 226, 2, 5290);
    			attr_dev(mark5, "class", "svelte-1lhfouh");
    			add_location(mark5, file, 231, 7, 5437);
    			attr_dev(code3, "class", "well svelte-1lhfouh");
    			add_location(code3, file, 230, 2, 5409);
    			attr_dev(div3, "class", "block svelte-1lhfouh");
    			add_location(div3, file, 30, 1, 541);
    			attr_dev(h22, "class", "svelte-1lhfouh");
    			add_location(h22, file, 235, 1, 5489);
    			attr_dev(mark6, "class", "svelte-1lhfouh");
    			add_location(mark6, file, 237, 1, 5508);
    			attr_dev(code4, "class", "svelte-1lhfouh");
    			add_location(code4, file, 252, 4, 5927);
    			attr_dev(div4, "class", "button-code-group svelte-1lhfouh");
    			add_location(div4, file, 243, 3, 5763);
    			attr_dev(div5, "class", "description svelte-1lhfouh");
    			add_location(div5, file, 240, 2, 5688);
    			attr_dev(div6, "class", "block svelte-1lhfouh");
    			add_location(div6, file, 239, 1, 5665);
    			attr_dev(h30, "class", "svelte-1lhfouh");
    			add_location(h30, file, 260, 2, 6029);
    			attr_dev(mark7, "class", "svelte-1lhfouh");
    			add_location(mark7, file, 263, 53, 6130);
    			attr_dev(mark8, "class", "svelte-1lhfouh");
    			add_location(mark8, file, 263, 72, 6149);
    			attr_dev(mark9, "class", "svelte-1lhfouh");
    			add_location(mark9, file, 275, 18, 6710);
    			attr_dev(mark10, "class", "svelte-1lhfouh");
    			add_location(mark10, file, 275, 57, 6749);
    			attr_dev(code5, "class", "svelte-1lhfouh");
    			add_location(code5, file, 274, 4, 6684);
    			attr_dev(div7, "class", "button-code-group svelte-1lhfouh");
    			add_location(div7, file, 265, 3, 6490);
    			attr_dev(mark11, "class", "svelte-1lhfouh");
    			add_location(mark11, file, 289, 18, 7038);
    			attr_dev(mark12, "class", "svelte-1lhfouh");
    			add_location(mark12, file, 289, 57, 7077);
    			attr_dev(code6, "class", "svelte-1lhfouh");
    			add_location(code6, file, 288, 4, 7012);
    			attr_dev(div8, "class", "button-code-group svelte-1lhfouh");
    			add_location(div8, file, 279, 3, 6822);
    			attr_dev(mark13, "class", "svelte-1lhfouh");
    			add_location(mark13, file, 303, 18, 7364);
    			attr_dev(mark14, "class", "svelte-1lhfouh");
    			add_location(mark14, file, 303, 55, 7401);
    			attr_dev(code7, "class", "svelte-1lhfouh");
    			add_location(code7, file, 302, 4, 7338);
    			attr_dev(div9, "class", "button-code-group svelte-1lhfouh");
    			add_location(div9, file, 293, 3, 7149);
    			attr_dev(mark15, "class", "svelte-1lhfouh");
    			add_location(mark15, file, 317, 18, 7692);
    			attr_dev(mark16, "class", "svelte-1lhfouh");
    			add_location(mark16, file, 317, 59, 7733);
    			attr_dev(code8, "class", "svelte-1lhfouh");
    			add_location(code8, file, 316, 4, 7666);
    			attr_dev(div10, "class", "button-code-group svelte-1lhfouh");
    			add_location(div10, file, 307, 3, 7473);
    			attr_dev(mark17, "class", "svelte-1lhfouh");
    			add_location(mark17, file, 331, 18, 8032);
    			attr_dev(mark18, "class", "svelte-1lhfouh");
    			add_location(mark18, file, 331, 59, 8073);
    			attr_dev(code9, "class", "svelte-1lhfouh");
    			add_location(code9, file, 330, 4, 8006);
    			attr_dev(div11, "class", "button-code-group svelte-1lhfouh");
    			add_location(div11, file, 321, 3, 7808);
    			attr_dev(mark19, "class", "svelte-1lhfouh");
    			add_location(mark19, file, 345, 18, 8376);
    			attr_dev(mark20, "class", "svelte-1lhfouh");
    			add_location(mark20, file, 345, 57, 8415);
    			attr_dev(code10, "class", "svelte-1lhfouh");
    			add_location(code10, file, 344, 4, 8350);
    			attr_dev(div12, "class", "button-code-group svelte-1lhfouh");
    			add_location(div12, file, 335, 3, 8151);
    			attr_dev(div13, "class", "description svelte-1lhfouh");
    			add_location(div13, file, 262, 2, 6050);
    			attr_dev(div14, "class", "block svelte-1lhfouh");
    			add_location(div14, file, 259, 1, 6006);
    			attr_dev(h31, "class", "svelte-1lhfouh");
    			add_location(h31, file, 352, 2, 8531);
    			attr_dev(mark21, "class", "svelte-1lhfouh");
    			add_location(mark21, file, 355, 70, 8649);
    			attr_dev(mark22, "class", "svelte-1lhfouh");
    			add_location(mark22, file, 367, 18, 9091);
    			attr_dev(code11, "class", "svelte-1lhfouh");
    			add_location(code11, file, 366, 4, 9065);
    			attr_dev(div15, "class", "button-code-group svelte-1lhfouh");
    			add_location(div15, file, 357, 3, 8895);
    			attr_dev(mark23, "class", "svelte-1lhfouh");
    			add_location(mark23, file, 381, 18, 9350);
    			attr_dev(code12, "class", "svelte-1lhfouh");
    			add_location(code12, file, 380, 4, 9324);
    			attr_dev(div16, "class", "button-code-group svelte-1lhfouh");
    			add_location(div16, file, 371, 3, 9150);
    			attr_dev(mark24, "class", "svelte-1lhfouh");
    			add_location(mark24, file, 395, 18, 9607);
    			attr_dev(code13, "class", "svelte-1lhfouh");
    			add_location(code13, file, 394, 4, 9581);
    			attr_dev(div17, "class", "button-code-group svelte-1lhfouh");
    			add_location(div17, file, 385, 3, 9409);
    			attr_dev(mark25, "class", "svelte-1lhfouh");
    			add_location(mark25, file, 409, 18, 9869);
    			attr_dev(code14, "class", "svelte-1lhfouh");
    			add_location(code14, file, 408, 4, 9843);
    			attr_dev(div18, "class", "button-code-group svelte-1lhfouh");
    			add_location(div18, file, 399, 3, 9667);
    			attr_dev(div19, "class", "description svelte-1lhfouh");
    			add_location(div19, file, 354, 2, 8552);
    			attr_dev(div20, "class", "block svelte-1lhfouh");
    			add_location(div20, file, 351, 1, 8508);
    			attr_dev(h32, "class", "svelte-1lhfouh");
    			add_location(h32, file, 416, 2, 9969);
    			attr_dev(mark26, "class", "svelte-1lhfouh");
    			add_location(mark26, file, 419, 163, 10179);
    			attr_dev(code15, "class", "svelte-1lhfouh");
    			add_location(code15, file, 430, 4, 10499);
    			attr_dev(div21, "class", "button-code-group svelte-1lhfouh");
    			add_location(div21, file, 421, 3, 10324);
    			attr_dev(mark27, "class", "svelte-1lhfouh");
    			add_location(mark27, file, 445, 18, 10775);
    			attr_dev(code16, "class", "svelte-1lhfouh");
    			add_location(code16, file, 444, 4, 10749);
    			attr_dev(div22, "class", "button-code-group svelte-1lhfouh");
    			add_location(div22, file, 435, 3, 10572);
    			attr_dev(code17, "class", "svelte-1lhfouh");
    			add_location(code17, file, 460, 4, 11143);
    			attr_dev(div23, "class", "button-code-group svelte-1lhfouh");
    			add_location(div23, file, 451, 3, 10954);
    			attr_dev(mark28, "class", "svelte-1lhfouh");
    			add_location(mark28, file, 475, 18, 11480);
    			attr_dev(code18, "class", "svelte-1lhfouh");
    			add_location(code18, file, 474, 4, 11454);
    			attr_dev(div24, "class", "button-code-group svelte-1lhfouh");
    			add_location(div24, file, 465, 3, 11252);
    			attr_dev(div25, "class", "description svelte-1lhfouh");
    			add_location(div25, file, 418, 2, 9989);
    			attr_dev(div26, "class", "block svelte-1lhfouh");
    			add_location(div26, file, 415, 1, 9946);
    			attr_dev(h33, "class", "svelte-1lhfouh");
    			add_location(h33, file, 484, 2, 11750);
    			attr_dev(mark29, "class", "svelte-1lhfouh");
    			add_location(mark29, file, 487, 61, 11857);
    			attr_dev(mark30, "class", "svelte-1lhfouh");
    			add_location(mark30, file, 499, 18, 12085);
    			attr_dev(code19, "class", "svelte-1lhfouh");
    			add_location(code19, file, 498, 4, 12059);
    			attr_dev(div27, "class", "button-code-group svelte-1lhfouh");
    			add_location(div27, file, 489, 3, 11891);
    			attr_dev(mark31, "class", "svelte-1lhfouh");
    			add_location(mark31, file, 513, 18, 12336);
    			attr_dev(code20, "class", "svelte-1lhfouh");
    			add_location(code20, file, 512, 4, 12310);
    			attr_dev(div28, "class", "button-code-group svelte-1lhfouh");
    			add_location(div28, file, 503, 3, 12141);
    			attr_dev(mark32, "class", "svelte-1lhfouh");
    			add_location(mark32, file, 517, 65, 12455);
    			attr_dev(mark33, "class", "svelte-1lhfouh");
    			add_location(mark33, file, 529, 18, 12695);
    			attr_dev(code21, "class", "svelte-1lhfouh");
    			add_location(code21, file, 528, 4, 12669);
    			attr_dev(div29, "class", "button-code-group svelte-1lhfouh");
    			add_location(div29, file, 519, 3, 12491);
    			attr_dev(div30, "class", "description svelte-1lhfouh");
    			add_location(div30, file, 486, 2, 11769);
    			attr_dev(div31, "class", "block svelte-1lhfouh");
    			add_location(div31, file, 483, 1, 11727);
    			attr_dev(h34, "class", "svelte-1lhfouh");
    			add_location(h34, file, 536, 2, 12800);
    			attr_dev(mark34, "class", "svelte-1lhfouh");
    			add_location(mark34, file, 539, 228, 13076);
    			attr_dev(mark35, "class", "svelte-1lhfouh");
    			add_location(mark35, file, 551, 18, 13358);
    			attr_dev(code22, "class", "svelte-1lhfouh");
    			add_location(code22, file, 550, 4, 13332);
    			attr_dev(div32, "class", "button-code-group svelte-1lhfouh");
    			add_location(div32, file, 541, 3, 13147);
    			attr_dev(mark36, "class", "svelte-1lhfouh");
    			add_location(mark36, file, 565, 18, 13645);
    			attr_dev(code23, "class", "svelte-1lhfouh");
    			add_location(code23, file, 564, 4, 13619);
    			attr_dev(div33, "class", "button-code-group svelte-1lhfouh");
    			add_location(div33, file, 555, 3, 13434);
    			attr_dev(mark37, "class", "svelte-1lhfouh");
    			add_location(mark37, file, 569, 72, 13791);
    			attr_dev(mark38, "class", "svelte-1lhfouh");
    			add_location(mark38, file, 581, 18, 14167);
    			attr_dev(code24, "class", "svelte-1lhfouh");
    			add_location(code24, file, 580, 4, 14141);
    			attr_dev(div34, "class", "button-code-group svelte-1lhfouh");
    			add_location(div34, file, 571, 3, 13957);
    			attr_dev(mark39, "class", "svelte-1lhfouh");
    			add_location(mark39, file, 595, 18, 14456);
    			attr_dev(mark40, "class", "svelte-1lhfouh");
    			add_location(mark40, file, 595, 40, 14478);
    			attr_dev(code25, "class", "svelte-1lhfouh");
    			add_location(code25, file, 594, 4, 14430);
    			attr_dev(div35, "class", "button-code-group svelte-1lhfouh");
    			add_location(div35, file, 585, 3, 14225);
    			attr_dev(mark41, "class", "svelte-1lhfouh");
    			add_location(mark41, file, 599, 99, 14651);
    			attr_dev(mark42, "class", "svelte-1lhfouh");
    			add_location(mark42, file, 611, 18, 15180);
    			attr_dev(code26, "class", "svelte-1lhfouh");
    			add_location(code26, file, 610, 4, 15154);
    			attr_dev(div36, "class", "button-code-group svelte-1lhfouh");
    			add_location(div36, file, 601, 3, 14954);
    			attr_dev(div37, "class", "description svelte-1lhfouh");
    			add_location(div37, file, 538, 2, 12821);
    			attr_dev(div38, "class", "block svelte-1lhfouh");
    			add_location(div38, file, 535, 1, 12777);
    			attr_dev(h35, "class", "svelte-1lhfouh");
    			add_location(h35, file, 618, 2, 15293);
    			attr_dev(mark43, "class", "svelte-1lhfouh");
    			add_location(mark43, file, 621, 103, 15443);
    			attr_dev(mark44, "class", "svelte-1lhfouh");
    			add_location(mark44, file, 621, 308, 15648);
    			attr_dev(mark45, "class", "svelte-1lhfouh");
    			add_location(mark45, file, 633, 18, 16021);
    			attr_dev(code27, "class", "svelte-1lhfouh");
    			add_location(code27, file, 632, 4, 15995);
    			attr_dev(div39, "class", "button-code-group svelte-1lhfouh");
    			add_location(div39, file, 623, 3, 15804);
    			attr_dev(mark46, "class", "svelte-1lhfouh");
    			add_location(mark46, file, 647, 18, 16360);
    			attr_dev(code28, "class", "svelte-1lhfouh");
    			add_location(code28, file, 646, 4, 16334);
    			attr_dev(div40, "class", "button-code-group svelte-1lhfouh");
    			add_location(div40, file, 637, 3, 16103);
    			attr_dev(mark47, "class", "svelte-1lhfouh");
    			add_location(mark47, file, 661, 18, 16752);
    			attr_dev(code29, "class", "svelte-1lhfouh");
    			add_location(code29, file, 660, 4, 16726);
    			attr_dev(div41, "class", "button-code-group svelte-1lhfouh");
    			add_location(div41, file, 651, 3, 16488);
    			attr_dev(mark48, "class", "svelte-1lhfouh");
    			add_location(mark48, file, 677, 18, 17262);
    			attr_dev(code30, "class", "svelte-1lhfouh");
    			add_location(code30, file, 676, 4, 17236);
    			attr_dev(div42, "class", "button-code-group svelte-1lhfouh");
    			add_location(div42, file, 667, 3, 17008);
    			attr_dev(mark49, "class", "svelte-1lhfouh");
    			add_location(mark49, file, 691, 18, 17692);
    			attr_dev(code31, "class", "svelte-1lhfouh");
    			add_location(code31, file, 690, 4, 17666);
    			attr_dev(div43, "class", "button-code-group svelte-1lhfouh");
    			add_location(div43, file, 681, 3, 17376);
    			attr_dev(mark50, "class", "svelte-1lhfouh");
    			add_location(mark50, file, 707, 18, 18202);
    			attr_dev(code32, "class", "svelte-1lhfouh");
    			add_location(code32, file, 706, 4, 18176);
    			attr_dev(div44, "class", "button-code-group svelte-1lhfouh");
    			add_location(div44, file, 697, 3, 17946);
    			attr_dev(div45, "class", "description svelte-1lhfouh");
    			add_location(div45, file, 620, 2, 15313);
    			attr_dev(div46, "class", "block svelte-1lhfouh");
    			add_location(div46, file, 617, 1, 15270);
    			attr_dev(h36, "class", "svelte-1lhfouh");
    			add_location(h36, file, 714, 2, 18378);
    			attr_dev(mark51, "class", "svelte-1lhfouh");
    			add_location(mark51, file, 717, 50, 18477);
    			attr_dev(mark52, "class", "svelte-1lhfouh");
    			add_location(mark52, file, 729, 18, 18863);
    			attr_dev(code33, "class", "svelte-1lhfouh");
    			add_location(code33, file, 728, 4, 18837);
    			attr_dev(div47, "class", "button-code-group svelte-1lhfouh");
    			add_location(div47, file, 719, 3, 18653);
    			attr_dev(mark53, "class", "svelte-1lhfouh");
    			add_location(mark53, file, 743, 18, 19141);
    			attr_dev(code34, "class", "svelte-1lhfouh");
    			add_location(code34, file, 742, 4, 19115);
    			attr_dev(div48, "class", "button-code-group svelte-1lhfouh");
    			add_location(div48, file, 733, 3, 18930);
    			attr_dev(mark54, "class", "svelte-1lhfouh");
    			add_location(mark54, file, 761, 18, 19566);
    			attr_dev(code35, "class", "svelte-1lhfouh");
    			add_location(code35, file, 760, 4, 19540);
    			attr_dev(div49, "class", "button-code-group svelte-1lhfouh");
    			add_location(div49, file, 747, 3, 19209);
    			attr_dev(mark55, "class", "svelte-1lhfouh");
    			add_location(mark55, file, 765, 115, 19744);
    			attr_dev(mark56, "class", "svelte-1lhfouh");
    			add_location(mark56, file, 777, 18, 19999);
    			attr_dev(code36, "class", "svelte-1lhfouh");
    			add_location(code36, file, 776, 4, 19973);
    			attr_dev(div50, "class", "button-code-group svelte-1lhfouh");
    			add_location(div50, file, 767, 3, 19783);
    			attr_dev(mark57, "class", "svelte-1lhfouh");
    			add_location(mark57, file, 791, 18, 20329);
    			attr_dev(code37, "class", "svelte-1lhfouh");
    			add_location(code37, file, 790, 4, 20303);
    			attr_dev(div51, "class", "button-code-group svelte-1lhfouh");
    			add_location(div51, file, 781, 3, 20071);
    			attr_dev(div52, "class", "description svelte-1lhfouh");
    			add_location(div52, file, 716, 2, 18400);
    			attr_dev(div53, "class", "block svelte-1lhfouh");
    			add_location(div53, file, 713, 1, 18355);
    			attr_dev(h37, "class", "svelte-1lhfouh");
    			add_location(h37, file, 798, 2, 20493);
    			add_location(br0, file, 801, 70, 20624);
    			add_location(small, file, 802, 116, 20746);
    			attr_dev(code38, "class", "svelte-1lhfouh");
    			add_location(code38, file, 816, 5, 21224);
    			attr_dev(code39, "class", "svelte-1lhfouh");
    			add_location(code39, file, 820, 5, 21362);
    			attr_dev(code40, "class", "svelte-1lhfouh");
    			add_location(code40, file, 824, 5, 21497);
    			add_location(div54, file, 815, 4, 21212);
    			attr_dev(div55, "class", "button-code-group svelte-1lhfouh");
    			add_location(div55, file, 804, 3, 20859);
    			attr_dev(code41, "class", "svelte-1lhfouh");
    			add_location(code41, file, 842, 5, 22066);
    			attr_dev(code42, "class", "svelte-1lhfouh");
    			add_location(code42, file, 846, 5, 22215);
    			attr_dev(code43, "class", "svelte-1lhfouh");
    			add_location(code43, file, 850, 5, 22364);
    			add_location(div56, file, 841, 4, 22054);
    			attr_dev(div57, "class", "button-code-group svelte-1lhfouh");
    			add_location(div57, file, 830, 3, 21655);
    			attr_dev(code44, "class", "svelte-1lhfouh");
    			add_location(code44, file, 884, 5, 24071);
    			attr_dev(code45, "class", "svelte-1lhfouh");
    			add_location(code45, file, 887, 5, 24222);
    			attr_dev(code46, "class", "svelte-1lhfouh");
    			add_location(code46, file, 890, 5, 24370);
    			attr_dev(code47, "class", "svelte-1lhfouh");
    			add_location(code47, file, 893, 5, 24519);
    			attr_dev(code48, "class", "svelte-1lhfouh");
    			add_location(code48, file, 896, 5, 24666);
    			attr_dev(code49, "class", "svelte-1lhfouh");
    			add_location(code49, file, 899, 5, 24815);
    			attr_dev(code50, "class", "svelte-1lhfouh");
    			add_location(code50, file, 902, 5, 24962);
    			attr_dev(code51, "class", "svelte-1lhfouh");
    			add_location(code51, file, 905, 5, 25111);
    			attr_dev(code52, "class", "svelte-1lhfouh");
    			add_location(code52, file, 908, 5, 25258);
    			attr_dev(code53, "class", "svelte-1lhfouh");
    			add_location(code53, file, 911, 5, 25407);
    			attr_dev(code54, "class", "svelte-1lhfouh");
    			add_location(code54, file, 914, 5, 25551);
    			attr_dev(code55, "class", "svelte-1lhfouh");
    			add_location(code55, file, 917, 5, 25697);
    			attr_dev(code56, "class", "svelte-1lhfouh");
    			add_location(code56, file, 920, 5, 25839);
    			attr_dev(code57, "class", "svelte-1lhfouh");
    			add_location(code57, file, 923, 5, 25983);
    			attr_dev(code58, "class", "svelte-1lhfouh");
    			add_location(code58, file, 926, 5, 26127);
    			add_location(div58, file, 883, 4, 24059);
    			attr_dev(div59, "class", "button-code-group svelte-1lhfouh");
    			add_location(div59, file, 856, 3, 22539);
    			attr_dev(code59, "class", "svelte-1lhfouh");
    			add_location(code59, file, 944, 5, 26788);
    			add_location(div60, file, 943, 4, 26776);
    			attr_dev(div61, "class", "button-code-group svelte-1lhfouh");
    			add_location(div61, file, 934, 3, 26580);
    			attr_dev(code60, "class", "svelte-1lhfouh");
    			add_location(code60, file, 962, 5, 27267);
    			attr_dev(code61, "class", "svelte-1lhfouh");
    			add_location(code61, file, 965, 5, 27346);
    			attr_dev(code62, "class", "svelte-1lhfouh");
    			add_location(code62, file, 968, 5, 27464);
    			add_location(div62, file, 961, 4, 27255);
    			attr_dev(div63, "class", "button-code-group svelte-1lhfouh");
    			add_location(div63, file, 950, 3, 26947);
    			attr_dev(code63, "class", "svelte-1lhfouh");
    			add_location(code63, file, 986, 5, 27840);
    			add_location(div64, file, 985, 4, 27828);
    			attr_dev(div65, "class", "button-code-group svelte-1lhfouh");
    			add_location(div65, file, 976, 3, 27636);
    			attr_dev(code64, "class", "svelte-1lhfouh");
    			add_location(code64, file, 1004, 5, 28297);
    			attr_dev(code65, "class", "svelte-1lhfouh");
    			add_location(code65, file, 1007, 5, 28381);
    			attr_dev(code66, "class", "svelte-1lhfouh");
    			add_location(code66, file, 1010, 5, 28504);
    			add_location(div66, file, 1003, 4, 28285);
    			attr_dev(div67, "class", "button-code-group svelte-1lhfouh");
    			add_location(div67, file, 992, 3, 27957);
    			attr_dev(code67, "class", "svelte-1lhfouh");
    			add_location(code67, file, 1030, 5, 29146);
    			attr_dev(code68, "class", "svelte-1lhfouh");
    			add_location(code68, file, 1033, 5, 29252);
    			attr_dev(code69, "class", "svelte-1lhfouh");
    			add_location(code69, file, 1036, 5, 29398);
    			add_location(div68, file, 1029, 4, 29134);
    			attr_dev(div69, "class", "button-code-group svelte-1lhfouh");
    			add_location(div69, file, 1018, 3, 28761);
    			attr_dev(code70, "class", "svelte-1lhfouh");
    			add_location(code70, file, 1057, 5, 30120);
    			attr_dev(code71, "class", "svelte-1lhfouh");
    			add_location(code71, file, 1060, 5, 30238);
    			attr_dev(code72, "class", "svelte-1lhfouh");
    			add_location(code72, file, 1063, 5, 30387);
    			attr_dev(code73, "class", "svelte-1lhfouh");
    			add_location(code73, file, 1066, 5, 30532);
    			add_location(div70, file, 1056, 4, 30108);
    			attr_dev(div71, "class", "button-code-group svelte-1lhfouh");
    			add_location(div71, file, 1044, 3, 29635);
    			attr_dev(code74, "class", "svelte-1lhfouh");
    			add_location(code74, file, 1084, 5, 31221);
    			attr_dev(code75, "class", "svelte-1lhfouh");
    			add_location(code75, file, 1087, 5, 31400);
    			attr_dev(code76, "class", "svelte-1lhfouh");
    			add_location(code76, file, 1090, 5, 31584);
    			add_location(div72, file, 1083, 4, 31209);
    			attr_dev(div73, "class", "button-code-group svelte-1lhfouh");
    			add_location(div73, file, 1072, 3, 30727);
    			attr_dev(div74, "class", "description svelte-1lhfouh");
    			add_location(div74, file, 800, 2, 20527);
    			attr_dev(div75, "class", "block svelte-1lhfouh");
    			add_location(div75, file, 797, 1, 20470);
    			attr_dev(h38, "class", "svelte-1lhfouh");
    			add_location(h38, file, 1099, 2, 31833);
    			add_location(br1, file, 1117, 21, 32651);
    			add_location(br2, file, 1118, 23, 32680);
    			add_location(br3, file, 1119, 18, 32704);
    			add_location(br4, file, 1120, 15, 32725);
    			add_location(br5, file, 1121, 21, 32752);
    			add_location(br6, file, 1122, 20, 32778);
    			add_location(br7, file, 1123, 21, 32805);
    			add_location(br8, file, 1124, 31, 32842);
    			add_location(br9, file, 1125, 29, 32877);
    			add_location(br10, file, 1127, 7, 33047);
    			attr_dev(code77, "class", "svelte-1lhfouh");
    			add_location(code77, file, 1116, 5, 32622);
    			add_location(div76, file, 1115, 4, 32610);
    			attr_dev(div77, "class", "button-code-group svelte-1lhfouh");
    			add_location(div77, file, 1104, 3, 32155);
    			attr_dev(mark58, "class", "svelte-1lhfouh");
    			add_location(mark58, file, 1133, 94, 33206);
    			attr_dev(code78, "class", "inline svelte-1lhfouh");
    			add_location(code78, file, 1133, 139, 33251);
    			add_location(br11, file, 1134, 3, 33322);
    			add_location(br12, file, 1135, 3, 33331);
    			attr_dev(code79, "class", "inline svelte-1lhfouh");
    			add_location(code79, file, 1136, 120, 33457);
    			attr_dev(code80, "class", "inline svelte-1lhfouh");
    			add_location(code80, file, 1136, 198, 33535);
    			attr_dev(div78, "class", "description svelte-1lhfouh");
    			add_location(div78, file, 1101, 2, 31866);
    			attr_dev(div79, "class", "block svelte-1lhfouh");
    			add_location(div79, file, 1098, 1, 31810);
    			attr_dev(h23, "class", "svelte-1lhfouh");
    			add_location(h23, file, 1140, 1, 33675);
    			attr_dev(p5, "class", "svelte-1lhfouh");
    			add_location(p5, file, 1143, 2, 33722);
    			attr_dev(strong0, "class", "svelte-1lhfouh");
    			add_location(strong0, file, 1146, 3, 33805);
    			attr_dev(strong1, "class", "svelte-1lhfouh");
    			add_location(strong1, file, 1146, 29, 33831);
    			attr_dev(strong2, "class", "svelte-1lhfouh");
    			add_location(strong2, file, 1146, 54, 33856);
    			attr_dev(code81, "class", "svelte-1lhfouh");
    			add_location(code81, file, 1148, 3, 33891);
    			attr_dev(code82, "class", "svelte-1lhfouh");
    			add_location(code82, file, 1148, 21, 33909);
    			add_location(div80, file, 1148, 37, 33925);
    			attr_dev(code83, "class", "svelte-1lhfouh");
    			add_location(code83, file, 1149, 3, 33998);
    			attr_dev(code84, "class", "svelte-1lhfouh");
    			add_location(code84, file, 1149, 18, 34013);
    			add_location(div81, file, 1149, 43, 34038);
    			attr_dev(code85, "class", "svelte-1lhfouh");
    			add_location(code85, file, 1150, 3, 34197);
    			attr_dev(code86, "class", "svelte-1lhfouh");
    			add_location(code86, file, 1150, 18, 34212);
    			add_location(div82, file, 1150, 41, 34235);
    			attr_dev(code87, "class", "svelte-1lhfouh");
    			add_location(code87, file, 1151, 3, 34386);
    			attr_dev(code88, "class", "svelte-1lhfouh");
    			add_location(code88, file, 1151, 25, 34408);
    			add_location(div83, file, 1151, 43, 34426);
    			attr_dev(code89, "class", "svelte-1lhfouh");
    			add_location(code89, file, 1152, 3, 34494);
    			attr_dev(code90, "class", "svelte-1lhfouh");
    			add_location(code90, file, 1152, 25, 34516);
    			add_location(div84, file, 1152, 44, 34535);
    			attr_dev(code91, "class", "svelte-1lhfouh");
    			add_location(code91, file, 1153, 3, 34603);
    			attr_dev(code92, "class", "svelte-1lhfouh");
    			add_location(code92, file, 1153, 22, 34622);
    			add_location(div85, file, 1153, 43, 34643);
    			attr_dev(code93, "class", "svelte-1lhfouh");
    			add_location(code93, file, 1154, 3, 34771);
    			attr_dev(code94, "class", "svelte-1lhfouh");
    			add_location(code94, file, 1154, 27, 34795);
    			add_location(div86, file, 1154, 49, 34817);
    			attr_dev(code95, "class", "svelte-1lhfouh");
    			add_location(code95, file, 1155, 3, 34928);
    			attr_dev(code96, "class", "svelte-1lhfouh");
    			add_location(code96, file, 1155, 27, 34952);
    			add_location(div87, file, 1155, 43, 34968);
    			attr_dev(code97, "class", "svelte-1lhfouh");
    			add_location(code97, file, 1156, 3, 35163);
    			attr_dev(code98, "class", "svelte-1lhfouh");
    			add_location(code98, file, 1156, 23, 35183);
    			add_location(div88, file, 1156, 39, 35199);
    			attr_dev(code99, "class", "svelte-1lhfouh");
    			add_location(code99, file, 1157, 3, 35354);
    			attr_dev(code100, "class", "svelte-1lhfouh");
    			add_location(code100, file, 1157, 31, 35382);
    			add_location(div89, file, 1157, 46, 35397);
    			attr_dev(code101, "class", "svelte-1lhfouh");
    			add_location(code101, file, 1158, 3, 35511);
    			attr_dev(code102, "class", "svelte-1lhfouh");
    			add_location(code102, file, 1158, 29, 35537);
    			add_location(div90, file, 1158, 50, 35558);
    			attr_dev(code103, "class", "svelte-1lhfouh");
    			add_location(code103, file, 1159, 3, 35654);
    			attr_dev(code104, "class", "svelte-1lhfouh");
    			add_location(code104, file, 1159, 24, 35675);
    			add_location(div91, file, 1159, 43, 35694);
    			attr_dev(code105, "class", "svelte-1lhfouh");
    			add_location(code105, file, 1160, 3, 35758);
    			attr_dev(code106, "class", "svelte-1lhfouh");
    			add_location(code106, file, 1160, 21, 35776);
    			add_location(div92, file, 1160, 40, 35795);
    			attr_dev(code107, "class", "svelte-1lhfouh");
    			add_location(code107, file, 1161, 3, 35939);
    			attr_dev(code108, "class", "svelte-1lhfouh");
    			add_location(code108, file, 1161, 26, 35962);
    			add_location(div93, file, 1161, 45, 35981);
    			attr_dev(div94, "class", "table svelte-1lhfouh");
    			add_location(div94, file, 1145, 2, 33781);
    			attr_dev(div95, "class", "block svelte-1lhfouh");
    			add_location(div95, file, 1142, 1, 33699);
    			attr_dev(a1, "href", "https://github.com/Mitcheljager");
    			attr_dev(a1, "class", "svelte-1lhfouh");
    			add_location(a1, file, 1166, 10, 36173);
    			attr_dev(div96, "class", "block svelte-1lhfouh");
    			add_location(div96, file, 1165, 1, 36142);
    			attr_dev(div97, "class", "wrapper svelte-1lhfouh");
    			add_location(div97, file, 7, 0, 127);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div97, anchor);
    			append_dev(div97, div0);
    			append_dev(div0, h1);
    			mount_component(confetti0, h1, null);
    			append_dev(h1, t0);
    			append_dev(h1, mark0);
    			append_dev(h1, t2);
    			mount_component(confetti1, h1, null);
    			append_dev(div97, t3);
    			append_dev(div97, div3);
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
    			append_dev(div2, t33);
    			mount_component(toggleconfetti18, div2, null);
    			append_dev(div2, t34);
    			mount_component(toggleconfetti19, div2, null);
    			append_dev(div3, t35);
    			append_dev(div3, h21);
    			append_dev(div3, t37);
    			append_dev(div3, p3);
    			append_dev(div3, t39);
    			append_dev(div3, code0);
    			append_dev(code0, t40);
    			append_dev(code0, mark1);
    			append_dev(div3, t42);
    			append_dev(div3, code1);
    			append_dev(code1, t43);
    			append_dev(code1, mark2);
    			append_dev(div3, t45);
    			append_dev(div3, p4);
    			append_dev(div3, t47);
    			append_dev(div3, code2);
    			append_dev(code2, t48);
    			append_dev(code2, mark3);
    			append_dev(code2, t50);
    			append_dev(code2, mark4);
    			append_dev(code2, t52);
    			append_dev(div3, t53);
    			append_dev(div3, code3);
    			append_dev(code3, t54);
    			append_dev(code3, mark5);
    			append_dev(code3, t56);
    			append_dev(div97, t57);
    			append_dev(div97, h22);
    			append_dev(div97, t59);
    			append_dev(div97, mark6);
    			append_dev(div97, t61);
    			append_dev(div97, div6);
    			append_dev(div6, div5);
    			append_dev(div5, t62);
    			append_dev(div5, div4);
    			mount_component(toggleconfetti20, div4, null);
    			append_dev(div4, t63);
    			append_dev(div4, code4);
    			append_dev(div97, t65);
    			append_dev(div97, div14);
    			append_dev(div14, h30);
    			append_dev(div14, t67);
    			append_dev(div14, div13);
    			append_dev(div13, t68);
    			append_dev(div13, mark7);
    			append_dev(div13, t70);
    			append_dev(div13, mark8);
    			append_dev(div13, t72);
    			append_dev(div13, div7);
    			mount_component(toggleconfetti21, div7, null);
    			append_dev(div7, t73);
    			append_dev(div7, code5);
    			append_dev(code5, t74);
    			append_dev(code5, mark9);
    			append_dev(code5, t76);
    			append_dev(code5, mark10);
    			append_dev(code5, t78);
    			append_dev(div13, t79);
    			append_dev(div13, div8);
    			mount_component(toggleconfetti22, div8, null);
    			append_dev(div8, t80);
    			append_dev(div8, code6);
    			append_dev(code6, t81);
    			append_dev(code6, mark11);
    			append_dev(code6, t83);
    			append_dev(code6, mark12);
    			append_dev(code6, t85);
    			append_dev(div13, t86);
    			append_dev(div13, div9);
    			mount_component(toggleconfetti23, div9, null);
    			append_dev(div9, t87);
    			append_dev(div9, code7);
    			append_dev(code7, t88);
    			append_dev(code7, mark13);
    			append_dev(code7, t90);
    			append_dev(code7, mark14);
    			append_dev(code7, t92);
    			append_dev(div13, t93);
    			append_dev(div13, div10);
    			mount_component(toggleconfetti24, div10, null);
    			append_dev(div10, t94);
    			append_dev(div10, code8);
    			append_dev(code8, t95);
    			append_dev(code8, mark15);
    			append_dev(code8, t97);
    			append_dev(code8, mark16);
    			append_dev(code8, t99);
    			append_dev(div13, t100);
    			append_dev(div13, div11);
    			mount_component(toggleconfetti25, div11, null);
    			append_dev(div11, t101);
    			append_dev(div11, code9);
    			append_dev(code9, t102);
    			append_dev(code9, mark17);
    			append_dev(code9, t104);
    			append_dev(code9, mark18);
    			append_dev(code9, t106);
    			append_dev(div13, t107);
    			append_dev(div13, div12);
    			mount_component(toggleconfetti26, div12, null);
    			append_dev(div12, t108);
    			append_dev(div12, code10);
    			append_dev(code10, t109);
    			append_dev(code10, mark19);
    			append_dev(code10, t111);
    			append_dev(code10, mark20);
    			append_dev(code10, t113);
    			append_dev(div97, t114);
    			append_dev(div97, div20);
    			append_dev(div20, h31);
    			append_dev(div20, t116);
    			append_dev(div20, div19);
    			append_dev(div19, t117);
    			append_dev(div19, mark21);
    			append_dev(div19, t119);
    			append_dev(div19, div15);
    			mount_component(toggleconfetti27, div15, null);
    			append_dev(div15, t120);
    			append_dev(div15, code11);
    			append_dev(code11, t121);
    			append_dev(code11, mark22);
    			append_dev(code11, t123);
    			append_dev(div19, t124);
    			append_dev(div19, div16);
    			mount_component(toggleconfetti28, div16, null);
    			append_dev(div16, t125);
    			append_dev(div16, code12);
    			append_dev(code12, t126);
    			append_dev(code12, mark23);
    			append_dev(code12, t128);
    			append_dev(div19, t129);
    			append_dev(div19, div17);
    			mount_component(toggleconfetti29, div17, null);
    			append_dev(div17, t130);
    			append_dev(div17, code13);
    			append_dev(code13, t131);
    			append_dev(code13, mark24);
    			append_dev(code13, t133);
    			append_dev(div19, t134);
    			append_dev(div19, div18);
    			mount_component(toggleconfetti30, div18, null);
    			append_dev(div18, t135);
    			append_dev(div18, code14);
    			append_dev(code14, t136);
    			append_dev(code14, mark25);
    			append_dev(code14, t138);
    			append_dev(div97, t139);
    			append_dev(div97, div26);
    			append_dev(div26, h32);
    			append_dev(div26, t141);
    			append_dev(div26, div25);
    			append_dev(div25, t142);
    			append_dev(div25, mark26);
    			append_dev(div25, t144);
    			append_dev(div25, div21);
    			mount_component(toggleconfetti31, div21, null);
    			append_dev(div21, t145);
    			append_dev(div21, code15);
    			append_dev(div25, t147);
    			append_dev(div25, div22);
    			mount_component(toggleconfetti32, div22, null);
    			append_dev(div22, t148);
    			append_dev(div22, code16);
    			append_dev(code16, t149);
    			append_dev(code16, mark27);
    			append_dev(code16, t151);
    			append_dev(div25, t152);
    			append_dev(div25, div23);
    			mount_component(toggleconfetti33, div23, null);
    			append_dev(div23, t153);
    			append_dev(div23, code17);
    			append_dev(div25, t155);
    			append_dev(div25, div24);
    			mount_component(toggleconfetti34, div24, null);
    			append_dev(div24, t156);
    			append_dev(div24, code18);
    			append_dev(code18, t157);
    			append_dev(code18, mark28);
    			append_dev(code18, t159);
    			append_dev(div25, t160);
    			append_dev(div97, t161);
    			append_dev(div97, div31);
    			append_dev(div31, h33);
    			append_dev(div31, t163);
    			append_dev(div31, div30);
    			append_dev(div30, t164);
    			append_dev(div30, mark29);
    			append_dev(div30, t166);
    			append_dev(div30, div27);
    			mount_component(toggleconfetti35, div27, null);
    			append_dev(div27, t167);
    			append_dev(div27, code19);
    			append_dev(code19, t168);
    			append_dev(code19, mark30);
    			append_dev(code19, t170);
    			append_dev(div30, t171);
    			append_dev(div30, div28);
    			mount_component(toggleconfetti36, div28, null);
    			append_dev(div28, t172);
    			append_dev(div28, code20);
    			append_dev(code20, t173);
    			append_dev(code20, mark31);
    			append_dev(code20, t175);
    			append_dev(div30, t176);
    			append_dev(div30, mark32);
    			append_dev(div30, t178);
    			append_dev(div30, div29);
    			mount_component(toggleconfetti37, div29, null);
    			append_dev(div29, t179);
    			append_dev(div29, code21);
    			append_dev(code21, t180);
    			append_dev(code21, mark33);
    			append_dev(code21, t182);
    			append_dev(div97, t183);
    			append_dev(div97, div38);
    			append_dev(div38, h34);
    			append_dev(div38, t185);
    			append_dev(div38, div37);
    			append_dev(div37, t186);
    			append_dev(div37, mark34);
    			append_dev(div37, t188);
    			append_dev(div37, div32);
    			mount_component(toggleconfetti38, div32, null);
    			append_dev(div32, t189);
    			append_dev(div32, code22);
    			append_dev(code22, t190);
    			append_dev(code22, mark35);
    			append_dev(code22, t192);
    			append_dev(div37, t193);
    			append_dev(div37, div33);
    			mount_component(toggleconfetti39, div33, null);
    			append_dev(div33, t194);
    			append_dev(div33, code23);
    			append_dev(code23, t195);
    			append_dev(code23, mark36);
    			append_dev(code23, t197);
    			append_dev(div37, t198);
    			append_dev(div37, mark37);
    			append_dev(div37, t200);
    			append_dev(div37, div34);
    			mount_component(toggleconfetti40, div34, null);
    			append_dev(div34, t201);
    			append_dev(div34, code24);
    			append_dev(code24, t202);
    			append_dev(code24, mark38);
    			append_dev(code24, t204);
    			append_dev(div37, t205);
    			append_dev(div37, div35);
    			mount_component(toggleconfetti41, div35, null);
    			append_dev(div35, t206);
    			append_dev(div35, code25);
    			append_dev(code25, t207);
    			append_dev(code25, mark39);
    			append_dev(code25, t209);
    			append_dev(code25, mark40);
    			append_dev(code25, t211);
    			append_dev(div37, t212);
    			append_dev(div37, mark41);
    			append_dev(div37, t214);
    			append_dev(div37, div36);
    			mount_component(toggleconfetti42, div36, null);
    			append_dev(div36, t215);
    			append_dev(div36, code26);
    			append_dev(code26, t216);
    			append_dev(code26, mark42);
    			append_dev(code26, t218);
    			append_dev(div97, t219);
    			append_dev(div97, div46);
    			append_dev(div46, h35);
    			append_dev(div46, t221);
    			append_dev(div46, div45);
    			append_dev(div45, t222);
    			append_dev(div45, mark43);
    			append_dev(div45, t224);
    			append_dev(div45, mark44);
    			append_dev(div45, t226);
    			append_dev(div45, div39);
    			mount_component(toggleconfetti43, div39, null);
    			append_dev(div39, t227);
    			append_dev(div39, code27);
    			append_dev(code27, t228);
    			append_dev(code27, mark45);
    			append_dev(code27, t230);
    			append_dev(div45, t231);
    			append_dev(div45, div40);
    			mount_component(toggleconfetti44, div40, null);
    			append_dev(div40, t232);
    			append_dev(div40, code28);
    			append_dev(code28, t233);
    			append_dev(code28, mark46);
    			append_dev(code28, t235);
    			append_dev(div45, t236);
    			append_dev(div45, div41);
    			mount_component(toggleconfetti45, div41, null);
    			append_dev(div41, t237);
    			append_dev(div41, code29);
    			append_dev(code29, t238);
    			append_dev(code29, mark47);
    			append_dev(code29, t240);
    			append_dev(div45, t241);
    			append_dev(div45, div42);
    			mount_component(toggleconfetti46, div42, null);
    			append_dev(div42, t242);
    			append_dev(div42, code30);
    			append_dev(code30, t243);
    			append_dev(code30, mark48);
    			append_dev(code30, t245);
    			append_dev(div45, t246);
    			append_dev(div45, div43);
    			mount_component(toggleconfetti47, div43, null);
    			append_dev(div43, t247);
    			append_dev(div43, code31);
    			append_dev(code31, t248);
    			append_dev(code31, mark49);
    			append_dev(code31, t250);
    			append_dev(div45, t251);
    			append_dev(div45, div44);
    			mount_component(toggleconfetti48, div44, null);
    			append_dev(div44, t252);
    			append_dev(div44, code32);
    			append_dev(code32, t253);
    			append_dev(code32, mark50);
    			append_dev(code32, t255);
    			append_dev(div97, t256);
    			append_dev(div97, div53);
    			append_dev(div53, h36);
    			append_dev(div53, t258);
    			append_dev(div53, div52);
    			append_dev(div52, t259);
    			append_dev(div52, mark51);
    			append_dev(div52, t261);
    			append_dev(div52, div47);
    			mount_component(toggleconfetti49, div47, null);
    			append_dev(div47, t262);
    			append_dev(div47, code33);
    			append_dev(code33, t263);
    			append_dev(code33, mark52);
    			append_dev(code33, t265);
    			append_dev(div52, t266);
    			append_dev(div52, div48);
    			mount_component(toggleconfetti50, div48, null);
    			append_dev(div48, t267);
    			append_dev(div48, code34);
    			append_dev(code34, t268);
    			append_dev(code34, mark53);
    			append_dev(code34, t270);
    			append_dev(div52, t271);
    			append_dev(div52, div49);
    			mount_component(toggleconfetti51, div49, null);
    			append_dev(div49, t272);
    			append_dev(div49, code35);
    			append_dev(code35, t273);
    			append_dev(code35, mark54);
    			append_dev(code35, t275);
    			append_dev(div52, t276);
    			append_dev(div52, mark55);
    			append_dev(div52, t278);
    			append_dev(div52, div50);
    			mount_component(toggleconfetti52, div50, null);
    			append_dev(div50, t279);
    			append_dev(div50, code36);
    			append_dev(code36, t280);
    			append_dev(code36, mark56);
    			append_dev(code36, t282);
    			append_dev(div52, t283);
    			append_dev(div52, div51);
    			mount_component(toggleconfetti53, div51, null);
    			append_dev(div51, t284);
    			append_dev(div51, code37);
    			append_dev(code37, t285);
    			append_dev(code37, mark57);
    			append_dev(code37, t287);
    			append_dev(div97, t288);
    			append_dev(div97, div75);
    			append_dev(div75, h37);
    			append_dev(div75, t290);
    			append_dev(div75, div74);
    			append_dev(div74, t291);
    			append_dev(div74, br0);
    			append_dev(div74, t292);
    			append_dev(div74, small);
    			append_dev(div74, t294);
    			append_dev(div74, div55);
    			mount_component(toggleconfetti54, div55, null);
    			append_dev(div55, t295);
    			append_dev(div55, div54);
    			append_dev(div54, code38);
    			append_dev(div54, t297);
    			append_dev(div54, code39);
    			append_dev(div54, t299);
    			append_dev(div54, code40);
    			append_dev(div74, t301);
    			append_dev(div74, div57);
    			mount_component(toggleconfetti55, div57, null);
    			append_dev(div57, t302);
    			append_dev(div57, div56);
    			append_dev(div56, code41);
    			append_dev(div56, t304);
    			append_dev(div56, code42);
    			append_dev(div56, t306);
    			append_dev(div56, code43);
    			append_dev(div74, t308);
    			append_dev(div74, div59);
    			mount_component(toggleconfetti56, div59, null);
    			append_dev(div59, t309);
    			append_dev(div59, div58);
    			append_dev(div58, code44);
    			append_dev(div58, t311);
    			append_dev(div58, code45);
    			append_dev(div58, t313);
    			append_dev(div58, code46);
    			append_dev(div58, t315);
    			append_dev(div58, code47);
    			append_dev(div58, t317);
    			append_dev(div58, code48);
    			append_dev(div58, t319);
    			append_dev(div58, code49);
    			append_dev(div58, t321);
    			append_dev(div58, code50);
    			append_dev(div58, t323);
    			append_dev(div58, code51);
    			append_dev(div58, t325);
    			append_dev(div58, code52);
    			append_dev(div58, t327);
    			append_dev(div58, code53);
    			append_dev(div58, t329);
    			append_dev(div58, code54);
    			append_dev(div58, t331);
    			append_dev(div58, code55);
    			append_dev(div58, t333);
    			append_dev(div58, code56);
    			append_dev(div58, t335);
    			append_dev(div58, code57);
    			append_dev(div58, t337);
    			append_dev(div58, code58);
    			append_dev(div74, t339);
    			append_dev(div74, div61);
    			mount_component(toggleconfetti57, div61, null);
    			append_dev(div61, t340);
    			append_dev(div61, div60);
    			append_dev(div60, code59);
    			append_dev(div74, t342);
    			append_dev(div74, div63);
    			mount_component(toggleconfetti58, div63, null);
    			append_dev(div63, t343);
    			append_dev(div63, div62);
    			append_dev(div62, code60);
    			append_dev(div62, t345);
    			append_dev(div62, code61);
    			append_dev(div62, t347);
    			append_dev(div62, code62);
    			append_dev(div74, t349);
    			append_dev(div74, div65);
    			mount_component(toggleconfetti59, div65, null);
    			append_dev(div65, t350);
    			append_dev(div65, div64);
    			append_dev(div64, code63);
    			append_dev(div74, t352);
    			append_dev(div74, div67);
    			mount_component(toggleconfetti60, div67, null);
    			append_dev(div67, t353);
    			append_dev(div67, div66);
    			append_dev(div66, code64);
    			append_dev(div66, t355);
    			append_dev(div66, code65);
    			append_dev(div66, t357);
    			append_dev(div66, code66);
    			append_dev(div74, t359);
    			append_dev(div74, div69);
    			mount_component(toggleconfetti61, div69, null);
    			append_dev(div69, t360);
    			append_dev(div69, div68);
    			append_dev(div68, code67);
    			append_dev(div68, t362);
    			append_dev(div68, code68);
    			append_dev(div68, t364);
    			append_dev(div68, code69);
    			append_dev(div74, t366);
    			append_dev(div74, div71);
    			mount_component(toggleconfetti62, div71, null);
    			append_dev(div71, t367);
    			append_dev(div71, div70);
    			append_dev(div70, code70);
    			append_dev(div70, t369);
    			append_dev(div70, code71);
    			append_dev(div70, t371);
    			append_dev(div70, code72);
    			append_dev(div70, t373);
    			append_dev(div70, code73);
    			append_dev(div74, t375);
    			append_dev(div74, div73);
    			mount_component(toggleconfetti63, div73, null);
    			append_dev(div73, t376);
    			append_dev(div73, div72);
    			append_dev(div72, code74);
    			append_dev(div72, t378);
    			append_dev(div72, code75);
    			append_dev(div72, t380);
    			append_dev(div72, code76);
    			append_dev(div97, t382);
    			append_dev(div97, div79);
    			append_dev(div79, h38);
    			append_dev(div79, t384);
    			append_dev(div79, div78);
    			append_dev(div78, t385);
    			append_dev(div78, div77);
    			mount_component(toggleconfetti64, div77, null);
    			append_dev(div77, t386);
    			append_dev(div77, div76);
    			append_dev(div76, code77);
    			append_dev(code77, t387);
    			append_dev(code77, br1);
    			append_dev(code77, t388);
    			append_dev(code77, br2);
    			append_dev(code77, t389);
    			append_dev(code77, br3);
    			append_dev(code77, t390);
    			append_dev(code77, br4);
    			append_dev(code77, t391);
    			append_dev(code77, br5);
    			append_dev(code77, t392);
    			append_dev(code77, br6);
    			append_dev(code77, t393);
    			append_dev(code77, br7);
    			append_dev(code77, t394);
    			append_dev(code77, br8);
    			append_dev(code77, t395);
    			append_dev(code77, br9);
    			append_dev(code77, t396);
    			append_dev(code77, br10);
    			append_dev(code77, t397);
    			append_dev(div78, t398);
    			append_dev(div78, mark58);
    			append_dev(div78, t400);
    			append_dev(div78, code78);
    			append_dev(div78, t402);
    			append_dev(div78, br11);
    			append_dev(div78, t403);
    			append_dev(div78, br12);
    			append_dev(div78, t404);
    			append_dev(div78, code79);
    			append_dev(div78, t406);
    			append_dev(div78, code80);
    			append_dev(div78, t408);
    			append_dev(div97, t409);
    			append_dev(div97, h23);
    			append_dev(div97, t411);
    			append_dev(div97, div95);
    			append_dev(div95, p5);
    			append_dev(div95, t413);
    			append_dev(div95, div94);
    			append_dev(div94, strong0);
    			append_dev(div94, t415);
    			append_dev(div94, strong1);
    			append_dev(div94, t417);
    			append_dev(div94, strong2);
    			append_dev(div94, t419);
    			append_dev(div94, code81);
    			append_dev(div94, t421);
    			append_dev(div94, code82);
    			append_dev(div94, t423);
    			append_dev(div94, div80);
    			append_dev(div94, t425);
    			append_dev(div94, code83);
    			append_dev(div94, t427);
    			append_dev(div94, code84);
    			append_dev(div94, t429);
    			append_dev(div94, div81);
    			append_dev(div94, t431);
    			append_dev(div94, code85);
    			append_dev(div94, t433);
    			append_dev(div94, code86);
    			append_dev(div94, t435);
    			append_dev(div94, div82);
    			append_dev(div94, t437);
    			append_dev(div94, code87);
    			append_dev(div94, t439);
    			append_dev(div94, code88);
    			append_dev(div94, t441);
    			append_dev(div94, div83);
    			append_dev(div94, t443);
    			append_dev(div94, code89);
    			append_dev(div94, t445);
    			append_dev(div94, code90);
    			append_dev(div94, t447);
    			append_dev(div94, div84);
    			append_dev(div94, t449);
    			append_dev(div94, code91);
    			append_dev(div94, t451);
    			append_dev(div94, code92);
    			append_dev(div94, t453);
    			append_dev(div94, div85);
    			append_dev(div94, t455);
    			append_dev(div94, code93);
    			append_dev(div94, t457);
    			append_dev(div94, code94);
    			append_dev(div94, t459);
    			append_dev(div94, div86);
    			append_dev(div94, t461);
    			append_dev(div94, code95);
    			append_dev(div94, t463);
    			append_dev(div94, code96);
    			append_dev(div94, t465);
    			append_dev(div94, div87);
    			append_dev(div94, t467);
    			append_dev(div94, code97);
    			append_dev(div94, t469);
    			append_dev(div94, code98);
    			append_dev(div94, t471);
    			append_dev(div94, div88);
    			append_dev(div94, t473);
    			append_dev(div94, code99);
    			append_dev(div94, t475);
    			append_dev(div94, code100);
    			append_dev(div94, t477);
    			append_dev(div94, div89);
    			append_dev(div94, t479);
    			append_dev(div94, code101);
    			append_dev(div94, t481);
    			append_dev(div94, code102);
    			append_dev(div94, t483);
    			append_dev(div94, div90);
    			append_dev(div94, t485);
    			append_dev(div94, code103);
    			append_dev(div94, t487);
    			append_dev(div94, code104);
    			append_dev(div94, t489);
    			append_dev(div94, div91);
    			append_dev(div94, t491);
    			append_dev(div94, code105);
    			append_dev(div94, t493);
    			append_dev(div94, code106);
    			append_dev(div94, t495);
    			append_dev(div94, div92);
    			append_dev(div94, t497);
    			append_dev(div94, code107);
    			append_dev(div94, t499);
    			append_dev(div94, code108);
    			append_dev(div94, t501);
    			append_dev(div94, div93);
    			append_dev(div97, t503);
    			append_dev(div97, div96);
    			append_dev(div96, t504);
    			append_dev(div96, a1);
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
    			const toggleconfetti36_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti36_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti36.$set(toggleconfetti36_changes);
    			const toggleconfetti37_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti37_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti37.$set(toggleconfetti37_changes);
    			const toggleconfetti38_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti38_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti38.$set(toggleconfetti38_changes);
    			const toggleconfetti39_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti39_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti39.$set(toggleconfetti39_changes);
    			const toggleconfetti40_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti40_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti40.$set(toggleconfetti40_changes);
    			const toggleconfetti41_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti41_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti41.$set(toggleconfetti41_changes);
    			const toggleconfetti42_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti42_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti42.$set(toggleconfetti42_changes);
    			const toggleconfetti43_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti43_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti43.$set(toggleconfetti43_changes);
    			const toggleconfetti44_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti44_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti44.$set(toggleconfetti44_changes);
    			const toggleconfetti45_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti45_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti45.$set(toggleconfetti45_changes);
    			const toggleconfetti46_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti46_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti46.$set(toggleconfetti46_changes);
    			const toggleconfetti47_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti47_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti47.$set(toggleconfetti47_changes);
    			const toggleconfetti48_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti48_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti48.$set(toggleconfetti48_changes);
    			const toggleconfetti49_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti49_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti49.$set(toggleconfetti49_changes);
    			const toggleconfetti50_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti50_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti50.$set(toggleconfetti50_changes);
    			const toggleconfetti51_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti51_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti51.$set(toggleconfetti51_changes);
    			const toggleconfetti52_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti52_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti52.$set(toggleconfetti52_changes);
    			const toggleconfetti53_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti53_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti53.$set(toggleconfetti53_changes);
    			const toggleconfetti54_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti54_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti54.$set(toggleconfetti54_changes);
    			const toggleconfetti55_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti55_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti55.$set(toggleconfetti55_changes);
    			const toggleconfetti56_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti56_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti56.$set(toggleconfetti56_changes);
    			const toggleconfetti57_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti57_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti57.$set(toggleconfetti57_changes);
    			const toggleconfetti58_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti58_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti58.$set(toggleconfetti58_changes);
    			const toggleconfetti59_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti59_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti59.$set(toggleconfetti59_changes);
    			const toggleconfetti60_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti60_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti60.$set(toggleconfetti60_changes);
    			const toggleconfetti61_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti61_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti61.$set(toggleconfetti61_changes);
    			const toggleconfetti62_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti62_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti62.$set(toggleconfetti62_changes);
    			const toggleconfetti63_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti63_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti63.$set(toggleconfetti63_changes);
    			const toggleconfetti64_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti64_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti64.$set(toggleconfetti64_changes);
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
    			transition_in(toggleconfetti36.$$.fragment, local);
    			transition_in(toggleconfetti37.$$.fragment, local);
    			transition_in(toggleconfetti38.$$.fragment, local);
    			transition_in(toggleconfetti39.$$.fragment, local);
    			transition_in(toggleconfetti40.$$.fragment, local);
    			transition_in(toggleconfetti41.$$.fragment, local);
    			transition_in(toggleconfetti42.$$.fragment, local);
    			transition_in(toggleconfetti43.$$.fragment, local);
    			transition_in(toggleconfetti44.$$.fragment, local);
    			transition_in(toggleconfetti45.$$.fragment, local);
    			transition_in(toggleconfetti46.$$.fragment, local);
    			transition_in(toggleconfetti47.$$.fragment, local);
    			transition_in(toggleconfetti48.$$.fragment, local);
    			transition_in(toggleconfetti49.$$.fragment, local);
    			transition_in(toggleconfetti50.$$.fragment, local);
    			transition_in(toggleconfetti51.$$.fragment, local);
    			transition_in(toggleconfetti52.$$.fragment, local);
    			transition_in(toggleconfetti53.$$.fragment, local);
    			transition_in(toggleconfetti54.$$.fragment, local);
    			transition_in(toggleconfetti55.$$.fragment, local);
    			transition_in(toggleconfetti56.$$.fragment, local);
    			transition_in(toggleconfetti57.$$.fragment, local);
    			transition_in(toggleconfetti58.$$.fragment, local);
    			transition_in(toggleconfetti59.$$.fragment, local);
    			transition_in(toggleconfetti60.$$.fragment, local);
    			transition_in(toggleconfetti61.$$.fragment, local);
    			transition_in(toggleconfetti62.$$.fragment, local);
    			transition_in(toggleconfetti63.$$.fragment, local);
    			transition_in(toggleconfetti64.$$.fragment, local);
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
    			transition_out(toggleconfetti36.$$.fragment, local);
    			transition_out(toggleconfetti37.$$.fragment, local);
    			transition_out(toggleconfetti38.$$.fragment, local);
    			transition_out(toggleconfetti39.$$.fragment, local);
    			transition_out(toggleconfetti40.$$.fragment, local);
    			transition_out(toggleconfetti41.$$.fragment, local);
    			transition_out(toggleconfetti42.$$.fragment, local);
    			transition_out(toggleconfetti43.$$.fragment, local);
    			transition_out(toggleconfetti44.$$.fragment, local);
    			transition_out(toggleconfetti45.$$.fragment, local);
    			transition_out(toggleconfetti46.$$.fragment, local);
    			transition_out(toggleconfetti47.$$.fragment, local);
    			transition_out(toggleconfetti48.$$.fragment, local);
    			transition_out(toggleconfetti49.$$.fragment, local);
    			transition_out(toggleconfetti50.$$.fragment, local);
    			transition_out(toggleconfetti51.$$.fragment, local);
    			transition_out(toggleconfetti52.$$.fragment, local);
    			transition_out(toggleconfetti53.$$.fragment, local);
    			transition_out(toggleconfetti54.$$.fragment, local);
    			transition_out(toggleconfetti55.$$.fragment, local);
    			transition_out(toggleconfetti56.$$.fragment, local);
    			transition_out(toggleconfetti57.$$.fragment, local);
    			transition_out(toggleconfetti58.$$.fragment, local);
    			transition_out(toggleconfetti59.$$.fragment, local);
    			transition_out(toggleconfetti60.$$.fragment, local);
    			transition_out(toggleconfetti61.$$.fragment, local);
    			transition_out(toggleconfetti62.$$.fragment, local);
    			transition_out(toggleconfetti63.$$.fragment, local);
    			transition_out(toggleconfetti64.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div97);
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
    			destroy_component(toggleconfetti36);
    			destroy_component(toggleconfetti37);
    			destroy_component(toggleconfetti38);
    			destroy_component(toggleconfetti39);
    			destroy_component(toggleconfetti40);
    			destroy_component(toggleconfetti41);
    			destroy_component(toggleconfetti42);
    			destroy_component(toggleconfetti43);
    			destroy_component(toggleconfetti44);
    			destroy_component(toggleconfetti45);
    			destroy_component(toggleconfetti46);
    			destroy_component(toggleconfetti47);
    			destroy_component(toggleconfetti48);
    			destroy_component(toggleconfetti49);
    			destroy_component(toggleconfetti50);
    			destroy_component(toggleconfetti51);
    			destroy_component(toggleconfetti52);
    			destroy_component(toggleconfetti53);
    			destroy_component(toggleconfetti54);
    			destroy_component(toggleconfetti55);
    			destroy_component(toggleconfetti56);
    			destroy_component(toggleconfetti57);
    			destroy_component(toggleconfetti58);
    			destroy_component(toggleconfetti59);
    			destroy_component(toggleconfetti60);
    			destroy_component(toggleconfetti61);
    			destroy_component(toggleconfetti62);
    			destroy_component(toggleconfetti63);
    			destroy_component(toggleconfetti64);
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
