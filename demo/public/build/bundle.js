
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
    function empty() {
        return text('');
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    const file$3 = "..\\src\\Confetti.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (41:0) {#if !complete}
    function create_if_block$1(ctx) {
    	let div;
    	let each_value = { length: /*amount*/ ctx[6] };
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "confetti-holder svelte-io58ff");
    			toggle_class(div, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(div, "cone", /*cone*/ ctx[10]);
    			toggle_class(div, "no-gravity", /*noGravity*/ ctx[11]);
    			add_location(div, file$3, 41, 2, 1104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fallDistance, size, getColor, randomBetween, y, x, infinite, duration, delay, iterationCount, xSpread, amount*/ 20991) {
    				each_value = { length: /*amount*/ ctx[6] };
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(41:0) {#if !complete}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#each { length: amount } as _}
    function create_each_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "confetti svelte-io58ff");
    			set_style(div, "--fall-distance", /*fallDistance*/ ctx[8]);
    			set_style(div, "--size", /*size*/ ctx[0] + "px");
    			set_style(div, "--color", /*getColor*/ ctx[14]());
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

    			set_style(div, "--x-spread", 1 - /*xSpread*/ ctx[12]);
    			add_location(div, file$3, 43, 6, 1232);
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

    			if (dirty & /*xSpread*/ 4096) {
    				set_style(div, "--x-spread", 1 - /*xSpread*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(43:4) {#each { length: amount } as _}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = !/*complete*/ ctx[13] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*complete*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randomBetween(min, max) {
    	return Math.random() * (max - min) + min;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    	let { xSpread = 0.15 } = $$props;
    	let { destroyOnComplete = true } = $$props;
    	let complete = false;

    	onMount(() => {
    		if (!destroyOnComplete || infinite || iterationCount == "infinite") return;
    		setTimeout(() => $$invalidate(13, complete = true), (duration + delay[1]) * iterationCount);
    	});

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
    		'noGravity',
    		'xSpread',
    		'destroyOnComplete'
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
    		if ('colorRange' in $$props) $$invalidate(15, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(16, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    		if ('noGravity' in $$props) $$invalidate(11, noGravity = $$props.noGravity);
    		if ('xSpread' in $$props) $$invalidate(12, xSpread = $$props.xSpread);
    		if ('destroyOnComplete' in $$props) $$invalidate(17, destroyOnComplete = $$props.destroyOnComplete);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
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
    		xSpread,
    		destroyOnComplete,
    		complete,
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
    		if ('colorRange' in $$props) $$invalidate(15, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(16, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    		if ('noGravity' in $$props) $$invalidate(11, noGravity = $$props.noGravity);
    		if ('xSpread' in $$props) $$invalidate(12, xSpread = $$props.xSpread);
    		if ('destroyOnComplete' in $$props) $$invalidate(17, destroyOnComplete = $$props.destroyOnComplete);
    		if ('complete' in $$props) $$invalidate(13, complete = $$props.complete);
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
    		xSpread,
    		complete,
    		getColor,
    		colorRange,
    		colorArray,
    		destroyOnComplete
    	];
    }

    class Confetti extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			size: 0,
    			x: 1,
    			y: 2,
    			duration: 3,
    			infinite: 4,
    			delay: 5,
    			colorRange: 15,
    			colorArray: 16,
    			amount: 6,
    			iterationCount: 7,
    			fallDistance: 8,
    			rounded: 9,
    			cone: 10,
    			noGravity: 11,
    			xSpread: 12,
    			destroyOnComplete: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Confetti",
    			options,
    			id: create_fragment$3.name
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

    	get xSpread() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xSpread(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get destroyOnComplete() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set destroyOnComplete(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ToggleConfetti.svelte generated by Svelte v3.42.1 */
    const file$2 = "src\\ToggleConfetti.svelte";
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
    			attr_dev(div, "class", "confetti svelte-yeb5bo");
    			add_location(div, file$2, 26, 4, 399);
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

    function create_fragment$2(ctx) {
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
    			attr_dev(span, "class", "svelte-yeb5bo");
    			toggle_class(span, "relative", /*relative*/ ctx[0]);
    			add_location(span, file$2, 22, 0, 312);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToggleConfetti', slots, ['label','default']);
    	let { toggleOnce = false } = $$props;
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { toggleOnce: 3, relative: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToggleConfetti",
    			options,
    			id: create_fragment$2.name
    		});
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

    /* src\ConfettiOnClick.svelte generated by Svelte v3.42.1 */
    const file$1 = "src\\ConfettiOnClick.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (31:2) {#each things as thing}
    function create_each_block(ctx) {
    	let div;
    	let confetti;
    	let t;
    	let current;

    	confetti = new Confetti({
    			props: {
    				y: [-0.5, 0.5],
    				fallDistance: "20px",
    				amount: "10",
    				duration
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(confetti.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "mover svelte-3ynqhx");
    			set_style(div, "left", /*thing*/ ctx[3].x + "px");
    			set_style(div, "top", /*thing*/ ctx[3].y + "px");
    			add_location(div, file$1, 31, 4, 646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(confetti, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*things*/ 1) {
    				set_style(div, "left", /*thing*/ ctx[3].x + "px");
    			}

    			if (!current || dirty & /*things*/ 1) {
    				set_style(div, "top", /*thing*/ ctx[3].y + "px");
    			}
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
    			if (detaching) detach_dev(div);
    			destroy_component(confetti);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(31:2) {#each things as thing}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let span;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*things*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Click in me";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "svelte-3ynqhx");
    			add_location(span, file$1, 28, 2, 587);
    			attr_dev(div, "class", "box svelte-3ynqhx");
    			add_location(div, file$1, 27, 0, 542);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*moveConfetti*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*things, duration*/ 1) {
    				each_value = /*things*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
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

    const duration = 2000;

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ConfettiOnClick', slots, []);
    	let things = [];
    	let timeout;

    	async function moveConfetti(event) {
    		const { target, clientX, clientY } = event;
    		const elementY = target.getBoundingClientRect().top;
    		const elementX = target.getBoundingClientRect().left;
    		const x = clientX - elementX;
    		const y = clientY - elementY;
    		$$invalidate(0, things = [...things, { x, y }]);
    		clearTimeout(timeout);
    		timeout = setTimeout(() => $$invalidate(0, things = []), duration);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ConfettiOnClick> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Confetti,
    		duration,
    		things,
    		timeout,
    		moveConfetti
    	});

    	$$self.$inject_state = $$props => {
    		if ('things' in $$props) $$invalidate(0, things = $$props.things);
    		if ('timeout' in $$props) timeout = $$props.timeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [things, moveConfetti];
    }

    class ConfettiOnClick extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConfettiOnClick",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.1 */
    const file = "src\\App.svelte";

    // (46:3) <ToggleConfetti>
    function create_default_slot_66(ctx) {
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
    		id: create_default_slot_66.name,
    		type: "slot",
    		source: "(46:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (47:4) 
    function create_label_slot_66(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 46, 4, 1513);
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
    		id: create_label_slot_66.name,
    		type: "slot",
    		source: "(47:4) ",
    		ctx
    	});

    	return block;
    }

    // (52:3) <ToggleConfetti>
    function create_default_slot_65(ctx) {
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
    		id: create_default_slot_65.name,
    		type: "slot",
    		source: "(52:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (53:4) 
    function create_label_slot_65(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Lots";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 52, 4, 1621);
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
    		id: create_label_slot_65.name,
    		type: "slot",
    		source: "(53:4) ",
    		ctx
    	});

    	return block;
    }

    // (58:3) <ToggleConfetti>
    function create_default_slot_64(ctx) {
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
    		id: create_default_slot_64.name,
    		type: "slot",
    		source: "(58:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (59:4) 
    function create_label_slot_64(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Few";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 58, 4, 1737);
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
    		source: "(59:4) ",
    		ctx
    	});

    	return block;
    }

    // (64:3) <ToggleConfetti>
    function create_default_slot_63(ctx) {
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
    		id: create_default_slot_63.name,
    		type: "slot",
    		source: "(64:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (65:4) 
    function create_label_slot_63(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Large";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 64, 4, 1851);
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
    		source: "(65:4) ",
    		ctx
    	});

    	return block;
    }

    // (70:3) <ToggleConfetti>
    function create_default_slot_62(ctx) {
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
    		id: create_default_slot_62.name,
    		type: "slot",
    		source: "(70:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (71:4) 
    function create_label_slot_62(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Rounded";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 70, 4, 1965);
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
    		source: "(71:4) ",
    		ctx
    	});

    	return block;
    }

    // (76:3) <ToggleConfetti>
    function create_default_slot_61(ctx) {
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
    		id: create_default_slot_61.name,
    		type: "slot",
    		source: "(76:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (77:4) 
    function create_label_slot_61(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Colored";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 76, 4, 2089);
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
    		source: "(77:4) ",
    		ctx
    	});

    	return block;
    }

    // (82:3) <ToggleConfetti>
    function create_default_slot_60(ctx) {
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
    		id: create_default_slot_60.name,
    		type: "slot",
    		source: "(82:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (83:4) 
    function create_label_slot_60(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Multi Colored";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 82, 4, 2229);
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
    		source: "(83:4) ",
    		ctx
    	});

    	return block;
    }

    // (88:3) <ToggleConfetti>
    function create_default_slot_59(ctx) {
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
    		id: create_default_slot_59.name,
    		type: "slot",
    		source: "(88:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (89:4) 
    function create_label_slot_59(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Images";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 88, 4, 2393);
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
    		source: "(89:4) ",
    		ctx
    	});

    	return block;
    }

    // (94:3) <ToggleConfetti>
    function create_default_slot_58(ctx) {
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
    		id: create_default_slot_58.name,
    		type: "slot",
    		source: "(94:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (95:4) 
    function create_label_slot_58(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Gradient";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 94, 4, 2627);
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
    		source: "(95:4) ",
    		ctx
    	});

    	return block;
    }

    // (100:3) <ToggleConfetti>
    function create_default_slot_57(ctx) {
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
    		id: create_default_slot_57.name,
    		type: "slot",
    		source: "(100:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (101:4) 
    function create_label_slot_57(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Flag";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 100, 4, 2802);
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
    		source: "(101:4) ",
    		ctx
    	});

    	return block;
    }

    // (108:3) <ToggleConfetti>
    function create_default_slot_56(ctx) {
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
    		id: create_default_slot_56.name,
    		type: "slot",
    		source: "(108:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (109:4) 
    function create_label_slot_56(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Vertical";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 108, 4, 3096);
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
    		source: "(109:4) ",
    		ctx
    	});

    	return block;
    }

    // (114:3) <ToggleConfetti>
    function create_default_slot_55(ctx) {
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
    		id: create_default_slot_55.name,
    		type: "slot",
    		source: "(114:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (115:4) 
    function create_label_slot_55(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Horizontal";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 114, 4, 3234);
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
    		source: "(115:4) ",
    		ctx
    	});

    	return block;
    }

    // (120:3) <ToggleConfetti>
    function create_default_slot_54(ctx) {
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
    		id: create_default_slot_54.name,
    		type: "slot",
    		source: "(120:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (121:4) 
    function create_label_slot_54(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 120, 4, 3373);
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
    		source: "(121:4) ",
    		ctx
    	});

    	return block;
    }

    // (126:3) <ToggleConfetti>
    function create_default_slot_53(ctx) {
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
    		id: create_default_slot_53.name,
    		type: "slot",
    		source: "(126:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (127:4) 
    function create_label_slot_53(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "All around";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 126, 4, 3483);
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
    		source: "(127:4) ",
    		ctx
    	});

    	return block;
    }

    // (132:3) <ToggleConfetti>
    function create_default_slot_52(ctx) {
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
    		id: create_default_slot_52.name,
    		type: "slot",
    		source: "(132:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (133:4) 
    function create_label_slot_52(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Explosion";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 132, 4, 3626);
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
    		source: "(133:4) ",
    		ctx
    	});

    	return block;
    }

    // (138:3) <ToggleConfetti>
    function create_default_slot_51(ctx) {
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
    		id: create_default_slot_51.name,
    		type: "slot",
    		source: "(138:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (139:4) 
    function create_label_slot_51(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Sparkles";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 138, 4, 3783);
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
    		source: "(139:4) ",
    		ctx
    	});

    	return block;
    }

    // (144:3) <ToggleConfetti>
    function create_default_slot_50(ctx) {
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
    		id: create_default_slot_50.name,
    		type: "slot",
    		source: "(144:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (145:4) 
    function create_label_slot_50(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Spray";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 144, 4, 3994);
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
    		source: "(145:4) ",
    		ctx
    	});

    	return block;
    }

    // (150:3) <ToggleConfetti>
    function create_default_slot_49(ctx) {
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
    		id: create_default_slot_49.name,
    		type: "slot",
    		source: "(150:3) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (151:4) 
    function create_label_slot_49(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 150, 4, 4117);
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
    		source: "(151:4) ",
    		ctx
    	});

    	return block;
    }

    // (158:3) <ToggleConfetti toggleOnce>
    function create_default_slot_48(ctx) {
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
    		id: create_default_slot_48.name,
    		type: "slot",
    		source: "(158:3) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (159:4) 
    function create_label_slot_48(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Constant";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 158, 4, 4387);
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
    		source: "(159:4) ",
    		ctx
    	});

    	return block;
    }

    // (164:3) <ToggleConfetti toggleOnce relative={false}>
    function create_default_slot_47(ctx) {
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
    			set_style(div, "pointer-events", "none");
    			add_location(div, file, 166, 4, 4608);
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
    		id: create_default_slot_47.name,
    		type: "slot",
    		source: "(164:3) <ToggleConfetti toggleOnce relative={false}>",
    		ctx
    	});

    	return block;
    }

    // (165:4) 
    function create_label_slot_47(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Fullscreen";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 164, 4, 4560);
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
    		source: "(165:4) ",
    		ctx
    	});

    	return block;
    }

    // (209:4) <ToggleConfetti>
    function create_default_slot_46(ctx) {
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
    		id: create_default_slot_46.name,
    		type: "slot",
    		source: "(209:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (210:5) 
    function create_label_slot_46(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 209, 5, 5785);
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
    		source: "(210:5) ",
    		ctx
    	});

    	return block;
    }

    // (229:4) <ToggleConfetti>
    function create_default_slot_45(ctx) {
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
    		id: create_default_slot_45.name,
    		type: "slot",
    		source: "(229:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (230:5) 
    function create_label_slot_45(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 229, 5, 6497);
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
    		source: "(230:5) ",
    		ctx
    	});

    	return block;
    }

    // (241:4) <ToggleConfetti>
    function create_default_slot_44(ctx) {
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
    		id: create_default_slot_44.name,
    		type: "slot",
    		source: "(241:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (242:5) 
    function create_label_slot_44(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Left";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 241, 5, 6814);
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
    		source: "(242:5) ",
    		ctx
    	});

    	return block;
    }

    // (253:4) <ToggleConfetti>
    function create_default_slot_43(ctx) {
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
    		id: create_default_slot_43.name,
    		type: "slot",
    		source: "(253:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (254:5) 
    function create_label_slot_43(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Right";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 253, 5, 7126);
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
    		source: "(254:5) ",
    		ctx
    	});

    	return block;
    }

    // (265:4) <ToggleConfetti>
    function create_default_slot_42(ctx) {
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
    		id: create_default_slot_42.name,
    		type: "slot",
    		source: "(265:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (266:5) 
    function create_label_slot_42(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Up";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 265, 5, 7435);
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
    		source: "(266:5) ",
    		ctx
    	});

    	return block;
    }

    // (277:4) <ToggleConfetti>
    function create_default_slot_41(ctx) {
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
    		id: create_default_slot_41.name,
    		type: "slot",
    		source: "(277:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (278:5) 
    function create_label_slot_41(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Down";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 277, 5, 7755);
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
    		source: "(278:5) ",
    		ctx
    	});

    	return block;
    }

    // (289:4) <ToggleConfetti>
    function create_default_slot_40(ctx) {
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
    		id: create_default_slot_40.name,
    		type: "slot",
    		source: "(289:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (290:5) 
    function create_label_slot_40(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Everywhere";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 289, 5, 8083);
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
    		source: "(290:5) ",
    		ctx
    	});

    	return block;
    }

    // (309:4) <ToggleConfetti>
    function create_default_slot_39(ctx) {
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
    		id: create_default_slot_39.name,
    		type: "slot",
    		source: "(309:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (310:5) 
    function create_label_slot_39(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Few";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 309, 5, 8812);
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
    		source: "(310:5) ",
    		ctx
    	});

    	return block;
    }

    // (321:4) <ToggleConfetti>
    function create_default_slot_38(ctx) {
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
    		id: create_default_slot_38.name,
    		type: "slot",
    		source: "(321:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (322:5) 
    function create_label_slot_38(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 321, 5, 9052);
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
    		source: "(322:5) ",
    		ctx
    	});

    	return block;
    }

    // (333:4) <ToggleConfetti>
    function create_default_slot_37(ctx) {
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
    		id: create_default_slot_37.name,
    		type: "slot",
    		source: "(333:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (334:5) 
    function create_label_slot_37(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Lots";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 333, 5, 9296);
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
    		source: "(334:5) ",
    		ctx
    	});

    	return block;
    }

    // (345:4) <ToggleConfetti>
    function create_default_slot_36(ctx) {
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
    		id: create_default_slot_36.name,
    		type: "slot",
    		source: "(345:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (346:5) 
    function create_label_slot_36(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Too many";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 345, 5, 9539);
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
    		source: "(346:5) ",
    		ctx
    	});

    	return block;
    }

    // (365:4) <ToggleConfetti>
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
    		source: "(365:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (366:5) 
    function create_label_slot_35(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 365, 5, 10181);
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
    		source: "(366:5) ",
    		ctx
    	});

    	return block;
    }

    // (377:4) <ToggleConfetti>
    function create_default_slot_34(ctx) {
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
    		id: create_default_slot_34.name,
    		type: "slot",
    		source: "(377:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (378:5) 
    function create_label_slot_34(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 377, 5, 10414);
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
    		source: "(378:5) ",
    		ctx
    	});

    	return block;
    }

    // (391:4) <ToggleConfetti>
    function create_default_slot_33(ctx) {
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
    		id: create_default_slot_33.name,
    		type: "slot",
    		source: "(391:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (392:5) 
    function create_label_slot_33(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Right";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 391, 5, 10781);
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
    		source: "(392:5) ",
    		ctx
    	});

    	return block;
    }

    // (403:4) <ToggleConfetti>
    function create_default_slot_32(ctx) {
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
    		id: create_default_slot_32.name,
    		type: "slot",
    		source: "(403:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (404:5) 
    function create_label_slot_32(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Right Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 403, 5, 11064);
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
    		source: "(404:5) ",
    		ctx
    	});

    	return block;
    }

    // (425:4) <ToggleConfetti>
    function create_default_slot_31(ctx) {
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
    		id: create_default_slot_31.name,
    		type: "slot",
    		source: "(425:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (426:5) 
    function create_label_slot_31(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Tiny";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 425, 5, 11688);
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
    		source: "(426:5) ",
    		ctx
    	});

    	return block;
    }

    // (437:4) <ToggleConfetti>
    function create_default_slot_30(ctx) {
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
    		id: create_default_slot_30.name,
    		type: "slot",
    		source: "(437:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (438:5) 
    function create_label_slot_30(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Huge";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 437, 5, 11923);
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
    		source: "(438:5) ",
    		ctx
    	});

    	return block;
    }

    // (451:4) <ToggleConfetti>
    function create_default_slot_29(ctx) {
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
    		id: create_default_slot_29.name,
    		type: "slot",
    		source: "(451:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (452:5) 
    function create_label_slot_29(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Round";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 451, 5, 12258);
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
    		source: "(452:5) ",
    		ctx
    	});

    	return block;
    }

    // (471:4) <ToggleConfetti>
    function create_default_slot_28(ctx) {
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
    		id: create_default_slot_28.name,
    		type: "slot",
    		source: "(471:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (472:5) 
    function create_label_slot_28(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Short delay";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 471, 5, 12899);
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
    		source: "(472:5) ",
    		ctx
    	});

    	return block;
    }

    // (483:4) <ToggleConfetti>
    function create_default_slot_27(ctx) {
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
    		id: create_default_slot_27.name,
    		type: "slot",
    		source: "(483:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (484:5) 
    function create_label_slot_27(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Long delay";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 483, 5, 13171);
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
    		source: "(484:5) ",
    		ctx
    	});

    	return block;
    }

    // (497:4) <ToggleConfetti toggleOnce>
    function create_default_slot_26(ctx) {
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
    		id: create_default_slot_26.name,
    		type: "slot",
    		source: "(497:4) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (498:5) 
    function create_label_slot_26(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Default";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 497, 5, 13690);
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
    		source: "(498:5) ",
    		ctx
    	});

    	return block;
    }

    // (509:4) <ToggleConfetti toggleOnce>
    function create_default_slot_25(ctx) {
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
    		id: create_default_slot_25.name,
    		type: "slot",
    		source: "(509:4) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (510:5) 
    function create_label_slot_25(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Long delay";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 509, 5, 13943);
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
    		source: "(510:5) ",
    		ctx
    	});

    	return block;
    }

    // (523:4) <ToggleConfetti toggleOnce>
    function create_default_slot_24(ctx) {
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
    		id: create_default_slot_24.name,
    		type: "slot",
    		source: "(523:4) <ToggleConfetti toggleOnce>",
    		ctx
    	});

    	return block;
    }

    // (524:5) 
    function create_label_slot_24(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Infinite";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 523, 5, 14657);
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
    		source: "(524:5) ",
    		ctx
    	});

    	return block;
    }

    // (543:4) <ToggleConfetti>
    function create_default_slot_23(ctx) {
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
    		id: create_default_slot_23.name,
    		type: "slot",
    		source: "(543:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (544:5) 
    function create_label_slot_23(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Green range";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 543, 5, 15481);
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
    		source: "(544:5) ",
    		ctx
    	});

    	return block;
    }

    // (555:4) <ToggleConfetti>
    function create_default_slot_22(ctx) {
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
    		id: create_default_slot_22.name,
    		type: "slot",
    		source: "(555:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (556:5) 
    function create_label_slot_22(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Array";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 555, 5, 15765);
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
    		source: "(556:5) ",
    		ctx
    	});

    	return block;
    }

    // (567:4) <ToggleConfetti>
    function create_default_slot_21(ctx) {
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
    		id: create_default_slot_21.name,
    		type: "slot",
    		source: "(567:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (568:5) 
    function create_label_slot_21(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Different values";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 567, 5, 16135);
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
    		source: "(568:5) ",
    		ctx
    	});

    	return block;
    }

    // (581:4) <ToggleConfetti>
    function create_default_slot_20(ctx) {
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
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(581:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (582:5) 
    function create_label_slot_20(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Gradient";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 581, 5, 16640);
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
    		source: "(582:5) ",
    		ctx
    	});

    	return block;
    }

    // (593:4) <ToggleConfetti>
    function create_default_slot_19(ctx) {
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
    		id: create_default_slot_19.name,
    		type: "slot",
    		source: "(593:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (594:5) 
    function create_label_slot_19(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Images";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 593, 5, 16993);
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
    		source: "(594:5) ",
    		ctx
    	});

    	return block;
    }

    // (607:4) <ToggleConfetti>
    function create_default_slot_18(ctx) {
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
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(607:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (608:5) 
    function create_label_slot_18(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Random";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 607, 5, 17548);
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
    		source: "(608:5) ",
    		ctx
    	});

    	return block;
    }

    // (627:4) <ToggleConfetti>
    function create_default_slot_17(ctx) {
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
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(627:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (628:5) 
    function create_label_slot_17(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Slow fall";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 627, 5, 18240);
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
    		source: "(628:5) ",
    		ctx
    	});

    	return block;
    }

    // (639:4) <ToggleConfetti>
    function create_default_slot_16(ctx) {
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
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(639:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (640:5) 
    function create_label_slot_16(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Fast fall";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 639, 5, 18502);
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
    		source: "(640:5) ",
    		ctx
    	});

    	return block;
    }

    // (651:4) <ToggleConfetti>
    function create_default_slot_15(ctx) {
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
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(651:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (652:5) 
    function create_label_slot_15(ctx) {
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
    			add_location(button, file, 652, 6, 18792);
    			attr_dev(code0, "class", "inline svelte-1lhfouh");
    			add_location(code0, file, 656, 36, 18872);
    			attr_dev(code1, "class", "inline svelte-1lhfouh");
    			add_location(code1, file, 656, 81, 18917);
    			add_location(small, file, 656, 6, 18842);
    			attr_dev(div, "slot", "label");
    			add_location(div, file, 651, 5, 18766);
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
    		id: create_label_slot_15.name,
    		type: "slot",
    		source: "(652:5) ",
    		ctx
    	});

    	return block;
    }

    // (671:4) <ToggleConfetti>
    function create_default_slot_14(ctx) {
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
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(671:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (672:5) 
    function create_label_slot_14(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "No gravity";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 671, 5, 19339);
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
    		source: "(672:5) ",
    		ctx
    	});

    	return block;
    }

    // (683:4) <ToggleConfetti>
    function create_default_slot_13(ctx) {
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
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(683:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (684:5) 
    function create_label_slot_13(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "No gravity explosion";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 683, 5, 19612);
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
    		source: "(684:5) ",
    		ctx
    	});

    	return block;
    }

    // (697:4) <ToggleConfetti>
    function create_default_slot_12(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { xSpread: "0.1" },
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
    		source: "(697:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (698:5) 
    function create_label_slot_12(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Small spread";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 697, 5, 20200);
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
    		source: "(698:5) ",
    		ctx
    	});

    	return block;
    }

    // (709:4) <ToggleConfetti>
    function create_default_slot_11(ctx) {
    	let confetti;
    	let current;

    	confetti = new Confetti({
    			props: { xSpread: "0.4" },
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
    		source: "(709:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (710:5) 
    function create_label_slot_11(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Large spread";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 709, 5, 20453);
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
    		source: "(710:5) ",
    		ctx
    	});

    	return block;
    }

    // (732:4) <ToggleConfetti>
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
    		source: "(732:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (733:5) 
    function create_label_slot_10(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Dutch";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 732, 5, 21101);
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
    		source: "(733:5) ",
    		ctx
    	});

    	return block;
    }

    // (750:4) <ToggleConfetti>
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
    		source: "(750:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (751:5) 
    function create_label_slot_9(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Swedish";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 750, 5, 21809);
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
    		source: "(751:5) ",
    		ctx
    	});

    	return block;
    }

    // (768:4) <ToggleConfetti>
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
    		source: "(768:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (769:5) 
    function create_label_slot_8(ctx) {
    	let div;
    	let button;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "USA";
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 769, 6, 22631);
    			attr_dev(div, "slot", "label");
    			add_location(div, file, 768, 5, 22605);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot_8.name,
    		type: "slot",
    		source: "(769:5) ",
    		ctx
    	});

    	return block;
    }

    // (818:4) <ToggleConfetti>
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
    		source: "(818:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (819:5) 
    function create_label_slot_7(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Not feathered";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 818, 5, 26198);
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
    		source: "(819:5) ",
    		ctx
    	});

    	return block;
    }

    // (832:4) <ToggleConfetti>
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
    		source: "(832:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (833:5) 
    function create_label_slot_6(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 832, 5, 26550);
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
    		source: "(833:5) ",
    		ctx
    	});

    	return block;
    }

    // (856:4) <ToggleConfetti>
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
    		source: "(856:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (857:5) 
    function create_label_slot_5(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 856, 5, 27224);
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
    		source: "(857:5) ",
    		ctx
    	});

    	return block;
    }

    // (870:4) <ToggleConfetti>
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
    		source: "(870:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (871:5) 
    function create_label_slot_4(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered cone";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 870, 5, 27530);
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
    		source: "(871:5) ",
    		ctx
    	});

    	return block;
    }

    // (894:4) <ToggleConfetti>
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
    		source: "(894:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (895:5) 
    function create_label_slot_3(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Feathered and delayed";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 894, 5, 28319);
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
    		source: "(895:5) ",
    		ctx
    	});

    	return block;
    }

    // (918:4) <ToggleConfetti>
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
    		source: "(918:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (919:5) 
    function create_label_slot_2(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Animate";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 918, 5, 29178);
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
    		source: "(919:5) ",
    		ctx
    	});

    	return block;
    }

    // (944:4) <ToggleConfetti>
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
    		source: "(944:4) <ToggleConfetti>",
    		ctx
    	});

    	return block;
    }

    // (945:5) 
    function create_label_slot_1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Animate explosion";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 944, 5, 30255);
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
    		source: "(945:5) ",
    		ctx
    	});

    	return block;
    }

    // (976:4) <ToggleConfetti toggleOnce relative={false}>
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
    			set_style(div, "pointer-events", "none");
    			add_location(div, file, 978, 5, 31734);
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
    		source: "(976:4) <ToggleConfetti toggleOnce relative={false}>",
    		ctx
    	});

    	return block;
    }

    // (977:5) 
    function create_label_slot(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Fullscreen";
    			attr_dev(button, "slot", "label");
    			attr_dev(button, "class", "svelte-1lhfouh");
    			add_location(button, file, 976, 5, 31685);
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
    		source: "(977:5) ",
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
    	let a1;
    	let t13;
    	let h20;
    	let t15;
    	let p2;
    	let t17;
    	let div2;
    	let toggleconfetti0;
    	let t18;
    	let toggleconfetti1;
    	let t19;
    	let toggleconfetti2;
    	let t20;
    	let toggleconfetti3;
    	let t21;
    	let toggleconfetti4;
    	let t22;
    	let toggleconfetti5;
    	let t23;
    	let toggleconfetti6;
    	let t24;
    	let toggleconfetti7;
    	let t25;
    	let toggleconfetti8;
    	let t26;
    	let toggleconfetti9;
    	let t27;
    	let toggleconfetti10;
    	let t28;
    	let toggleconfetti11;
    	let t29;
    	let toggleconfetti12;
    	let t30;
    	let toggleconfetti13;
    	let t31;
    	let toggleconfetti14;
    	let t32;
    	let toggleconfetti15;
    	let t33;
    	let toggleconfetti16;
    	let t34;
    	let toggleconfetti17;
    	let t35;
    	let toggleconfetti18;
    	let t36;
    	let toggleconfetti19;
    	let t37;
    	let br0;
    	let t38;
    	let confettionclick0;
    	let t39;
    	let h21;
    	let t41;
    	let p3;
    	let t43;
    	let code0;
    	let t44;
    	let mark1;
    	let t46;
    	let code1;
    	let t47;
    	let mark2;
    	let t49;
    	let p4;
    	let t51;
    	let code2;
    	let t52;
    	let mark3;
    	let t54;
    	let mark4;
    	let t56;
    	let t57;
    	let code3;
    	let t58;
    	let mark5;
    	let t60;
    	let t61;
    	let h22;
    	let t63;
    	let mark6;
    	let t65;
    	let div6;
    	let div5;
    	let t66;
    	let div4;
    	let toggleconfetti20;
    	let t67;
    	let code4;
    	let t69;
    	let div14;
    	let h30;
    	let t71;
    	let div13;
    	let t72;
    	let mark7;
    	let t74;
    	let mark8;
    	let t76;
    	let div7;
    	let toggleconfetti21;
    	let t77;
    	let code5;
    	let t78;
    	let mark9;
    	let t80;
    	let mark10;
    	let t82;
    	let t83;
    	let div8;
    	let toggleconfetti22;
    	let t84;
    	let code6;
    	let t85;
    	let mark11;
    	let t87;
    	let mark12;
    	let t89;
    	let t90;
    	let div9;
    	let toggleconfetti23;
    	let t91;
    	let code7;
    	let t92;
    	let mark13;
    	let t94;
    	let mark14;
    	let t96;
    	let t97;
    	let div10;
    	let toggleconfetti24;
    	let t98;
    	let code8;
    	let t99;
    	let mark15;
    	let t101;
    	let mark16;
    	let t103;
    	let t104;
    	let div11;
    	let toggleconfetti25;
    	let t105;
    	let code9;
    	let t106;
    	let mark17;
    	let t108;
    	let mark18;
    	let t110;
    	let t111;
    	let div12;
    	let toggleconfetti26;
    	let t112;
    	let code10;
    	let t113;
    	let mark19;
    	let t115;
    	let mark20;
    	let t117;
    	let t118;
    	let div20;
    	let h31;
    	let t120;
    	let div19;
    	let t121;
    	let mark21;
    	let t123;
    	let div15;
    	let toggleconfetti27;
    	let t124;
    	let code11;
    	let t125;
    	let mark22;
    	let t127;
    	let t128;
    	let div16;
    	let toggleconfetti28;
    	let t129;
    	let code12;
    	let t130;
    	let mark23;
    	let t132;
    	let t133;
    	let div17;
    	let toggleconfetti29;
    	let t134;
    	let code13;
    	let t135;
    	let mark24;
    	let t137;
    	let t138;
    	let div18;
    	let toggleconfetti30;
    	let t139;
    	let code14;
    	let t140;
    	let mark25;
    	let t142;
    	let t143;
    	let div26;
    	let h32;
    	let t145;
    	let div25;
    	let t146;
    	let mark26;
    	let t148;
    	let div21;
    	let toggleconfetti31;
    	let t149;
    	let code15;
    	let t151;
    	let div22;
    	let toggleconfetti32;
    	let t152;
    	let code16;
    	let t153;
    	let mark27;
    	let t155;
    	let t156;
    	let div23;
    	let toggleconfetti33;
    	let t157;
    	let code17;
    	let t159;
    	let div24;
    	let toggleconfetti34;
    	let t160;
    	let code18;
    	let t161;
    	let mark28;
    	let t163;
    	let t164;
    	let t165;
    	let div31;
    	let h33;
    	let t167;
    	let div30;
    	let t168;
    	let mark29;
    	let t170;
    	let div27;
    	let toggleconfetti35;
    	let t171;
    	let code19;
    	let t172;
    	let mark30;
    	let t174;
    	let t175;
    	let div28;
    	let toggleconfetti36;
    	let t176;
    	let code20;
    	let t177;
    	let mark31;
    	let t179;
    	let t180;
    	let mark32;
    	let t182;
    	let div29;
    	let toggleconfetti37;
    	let t183;
    	let code21;
    	let t184;
    	let mark33;
    	let t186;
    	let t187;
    	let div38;
    	let h34;
    	let t189;
    	let div37;
    	let t190;
    	let mark34;
    	let t192;
    	let div32;
    	let toggleconfetti38;
    	let t193;
    	let code22;
    	let t194;
    	let mark35;
    	let t196;
    	let t197;
    	let div33;
    	let toggleconfetti39;
    	let t198;
    	let code23;
    	let t199;
    	let mark36;
    	let t201;
    	let t202;
    	let mark37;
    	let t204;
    	let div34;
    	let toggleconfetti40;
    	let t205;
    	let code24;
    	let t206;
    	let mark38;
    	let t208;
    	let t209;
    	let div35;
    	let toggleconfetti41;
    	let t210;
    	let code25;
    	let t211;
    	let mark39;
    	let t213;
    	let mark40;
    	let t215;
    	let t216;
    	let mark41;
    	let t218;
    	let div36;
    	let toggleconfetti42;
    	let t219;
    	let code26;
    	let t220;
    	let mark42;
    	let t222;
    	let t223;
    	let div46;
    	let h35;
    	let t225;
    	let div45;
    	let t226;
    	let mark43;
    	let t228;
    	let mark44;
    	let t230;
    	let div39;
    	let toggleconfetti43;
    	let t231;
    	let code27;
    	let t232;
    	let mark45;
    	let t234;
    	let t235;
    	let div40;
    	let toggleconfetti44;
    	let t236;
    	let code28;
    	let t237;
    	let mark46;
    	let t239;
    	let t240;
    	let div41;
    	let toggleconfetti45;
    	let t241;
    	let code29;
    	let t242;
    	let mark47;
    	let t244;
    	let t245;
    	let div42;
    	let toggleconfetti46;
    	let t246;
    	let code30;
    	let t247;
    	let mark48;
    	let t249;
    	let t250;
    	let div43;
    	let toggleconfetti47;
    	let t251;
    	let code31;
    	let t252;
    	let mark49;
    	let t254;
    	let t255;
    	let div44;
    	let toggleconfetti48;
    	let t256;
    	let code32;
    	let t257;
    	let mark50;
    	let t259;
    	let t260;
    	let div55;
    	let h36;
    	let t262;
    	let div54;
    	let t263;
    	let mark51;
    	let t265;
    	let div47;
    	let toggleconfetti49;
    	let t266;
    	let code33;
    	let t267;
    	let mark52;
    	let t269;
    	let t270;
    	let div48;
    	let toggleconfetti50;
    	let t271;
    	let code34;
    	let t272;
    	let mark53;
    	let t274;
    	let t275;
    	let div49;
    	let toggleconfetti51;
    	let t276;
    	let code35;
    	let t277;
    	let mark54;
    	let t279;
    	let t280;
    	let mark55;
    	let t282;
    	let div50;
    	let toggleconfetti52;
    	let t283;
    	let code36;
    	let t284;
    	let mark56;
    	let t286;
    	let t287;
    	let div51;
    	let toggleconfetti53;
    	let t288;
    	let code37;
    	let t289;
    	let mark57;
    	let t291;
    	let t292;
    	let mark58;
    	let t294;
    	let div52;
    	let toggleconfetti54;
    	let t295;
    	let code38;
    	let t296;
    	let mark59;
    	let t298;
    	let t299;
    	let div53;
    	let toggleconfetti55;
    	let t300;
    	let code39;
    	let t301;
    	let mark60;
    	let t303;
    	let t304;
    	let div74;
    	let h37;
    	let t306;
    	let div73;
    	let t307;
    	let br1;
    	let t308;
    	let small0;
    	let t310;
    	let br2;
    	let br3;
    	let t311;
    	let div56;
    	let toggleconfetti56;
    	let t312;
    	let code40;
    	let t313;
    	let br4;
    	let t314;
    	let br5;
    	let t315;
    	let br6;
    	let t316;
    	let br7;
    	let t317;
    	let div57;
    	let toggleconfetti57;
    	let t318;
    	let code41;
    	let t319;
    	let br8;
    	let t320;
    	let br9;
    	let t321;
    	let br10;
    	let t322;
    	let br11;
    	let t323;
    	let div58;
    	let toggleconfetti58;
    	let t324;
    	let small1;
    	let t326;
    	let code42;
    	let t327;
    	let br12;
    	let t328;
    	let br13;
    	let t329;
    	let br14;
    	let t330;
    	let br15;
    	let t331;
    	let br16;
    	let t332;
    	let br17;
    	let t333;
    	let br18;
    	let t334;
    	let br19;
    	let t335;
    	let br20;
    	let t336;
    	let br21;
    	let t337;
    	let br22;
    	let t338;
    	let br23;
    	let t339;
    	let br24;
    	let t340;
    	let br25;
    	let t341;
    	let br26;
    	let t342;
    	let div60;
    	let toggleconfetti59;
    	let t343;
    	let div59;
    	let code43;
    	let t345;
    	let div62;
    	let toggleconfetti60;
    	let t346;
    	let div61;
    	let code44;
    	let t348;
    	let code45;
    	let t350;
    	let code46;
    	let t352;
    	let div64;
    	let toggleconfetti61;
    	let t353;
    	let div63;
    	let code47;
    	let t355;
    	let div66;
    	let toggleconfetti62;
    	let t356;
    	let div65;
    	let code48;
    	let t358;
    	let code49;
    	let t360;
    	let code50;
    	let t362;
    	let div68;
    	let toggleconfetti63;
    	let t363;
    	let div67;
    	let code51;
    	let t365;
    	let code52;
    	let t367;
    	let code53;
    	let t369;
    	let div70;
    	let toggleconfetti64;
    	let t370;
    	let div69;
    	let code54;
    	let t372;
    	let code55;
    	let t374;
    	let code56;
    	let t376;
    	let code57;
    	let t378;
    	let div72;
    	let toggleconfetti65;
    	let t379;
    	let div71;
    	let code58;
    	let t381;
    	let code59;
    	let t383;
    	let code60;
    	let t385;
    	let div77;
    	let h38;
    	let t387;
    	let div76;
    	let t388;
    	let br27;
    	let br28;
    	let t389;
    	let div75;
    	let toggleconfetti66;
    	let t390;
    	let code61;
    	let t391;
    	let br29;
    	let t392;
    	let br30;
    	let t393;
    	let br31;
    	let t394;
    	let br32;
    	let t395;
    	let br33;
    	let t396;
    	let br34;
    	let t397;
    	let br35;
    	let t398;
    	let br36;
    	let t399;
    	let br37;
    	let t400;
    	let br38;
    	let t401;
    	let br39;
    	let t402;
    	let t403;
    	let br40;
    	let t404;
    	let mark61;
    	let t406;
    	let code62;
    	let t408;
    	let br41;
    	let t409;
    	let br42;
    	let t410;
    	let a2;
    	let t412;
    	let br43;
    	let t413;
    	let br44;
    	let t414;
    	let confettionclick1;
    	let t415;
    	let br45;
    	let t416;
    	let br46;
    	let t417;
    	let br47;
    	let t418;
    	let br48;
    	let t419;
    	let code63;
    	let t421;
    	let code64;
    	let t423;
    	let t424;
    	let h23;
    	let t426;
    	let div95;
    	let p5;
    	let t428;
    	let div94;
    	let strong0;
    	let t430;
    	let strong1;
    	let t432;
    	let strong2;
    	let t434;
    	let code65;
    	let t436;
    	let code66;
    	let t438;
    	let div78;
    	let t440;
    	let code67;
    	let t442;
    	let code68;
    	let t444;
    	let div79;
    	let t446;
    	let code69;
    	let t448;
    	let code70;
    	let t450;
    	let div80;
    	let t452;
    	let code71;
    	let t454;
    	let code72;
    	let t456;
    	let div81;
    	let t458;
    	let code73;
    	let t460;
    	let code74;
    	let t462;
    	let div82;
    	let t464;
    	let code75;
    	let t466;
    	let code76;
    	let t468;
    	let div83;
    	let t470;
    	let code77;
    	let t472;
    	let code78;
    	let t474;
    	let div84;
    	let t476;
    	let code79;
    	let t478;
    	let code80;
    	let t480;
    	let div85;
    	let t482;
    	let code81;
    	let t484;
    	let code82;
    	let t486;
    	let div86;
    	let t488;
    	let code83;
    	let t490;
    	let code84;
    	let t492;
    	let div87;
    	let t494;
    	let code85;
    	let t496;
    	let code86;
    	let t498;
    	let div88;
    	let t500;
    	let code87;
    	let t502;
    	let code88;
    	let t504;
    	let div89;
    	let t506;
    	let code89;
    	let t508;
    	let code90;
    	let t510;
    	let div90;
    	let t512;
    	let code91;
    	let t514;
    	let code92;
    	let t516;
    	let div91;
    	let t518;
    	let code93;
    	let t520;
    	let code94;
    	let t522;
    	let div92;
    	let t524;
    	let code95;
    	let t526;
    	let code96;
    	let t528;
    	let div93;
    	let t530;
    	let div96;
    	let t531;
    	let a3;
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
    					label: [create_label_slot_66],
    					default: [create_default_slot_66]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti1 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_65],
    					default: [create_default_slot_65]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti2 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_64],
    					default: [create_default_slot_64]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti3 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_63],
    					default: [create_default_slot_63]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti4 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_62],
    					default: [create_default_slot_62]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti5 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_61],
    					default: [create_default_slot_61]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti6 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_60],
    					default: [create_default_slot_60]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti7 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_59],
    					default: [create_default_slot_59]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti8 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_58],
    					default: [create_default_slot_58]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti9 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_57],
    					default: [create_default_slot_57]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti10 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_56],
    					default: [create_default_slot_56]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti11 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_55],
    					default: [create_default_slot_55]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti12 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_54],
    					default: [create_default_slot_54]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti13 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_53],
    					default: [create_default_slot_53]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti14 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_52],
    					default: [create_default_slot_52]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti15 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_51],
    					default: [create_default_slot_51]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti16 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_50],
    					default: [create_default_slot_50]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti17 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_49],
    					default: [create_default_slot_49]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti18 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_48],
    					default: [create_default_slot_48]
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
    					label: [create_label_slot_47],
    					default: [create_default_slot_47]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	confettionclick0 = new ConfettiOnClick({ $$inline: true });

    	toggleconfetti20 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_46],
    					default: [create_default_slot_46]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti21 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_45],
    					default: [create_default_slot_45]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti22 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_44],
    					default: [create_default_slot_44]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti23 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_43],
    					default: [create_default_slot_43]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti24 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_42],
    					default: [create_default_slot_42]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti25 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_41],
    					default: [create_default_slot_41]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti26 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_40],
    					default: [create_default_slot_40]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti27 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_39],
    					default: [create_default_slot_39]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti28 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_38],
    					default: [create_default_slot_38]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti29 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_37],
    					default: [create_default_slot_37]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti30 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_36],
    					default: [create_default_slot_36]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti31 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_35],
    					default: [create_default_slot_35]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti32 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_34],
    					default: [create_default_slot_34]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti33 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_33],
    					default: [create_default_slot_33]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti34 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_32],
    					default: [create_default_slot_32]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti35 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_31],
    					default: [create_default_slot_31]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti36 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_30],
    					default: [create_default_slot_30]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti37 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_29],
    					default: [create_default_slot_29]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti38 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_28],
    					default: [create_default_slot_28]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti39 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_27],
    					default: [create_default_slot_27]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti40 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_26],
    					default: [create_default_slot_26]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti41 = new ToggleConfetti({
    			props: {
    				toggleOnce: true,
    				$$slots: {
    					label: [create_label_slot_25],
    					default: [create_default_slot_25]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti42 = new ToggleConfetti({
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

    	toggleconfetti43 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_23],
    					default: [create_default_slot_23]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti44 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_22],
    					default: [create_default_slot_22]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti45 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_21],
    					default: [create_default_slot_21]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti46 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_20],
    					default: [create_default_slot_20]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti47 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_19],
    					default: [create_default_slot_19]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti48 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_18],
    					default: [create_default_slot_18]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti49 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_17],
    					default: [create_default_slot_17]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti50 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_16],
    					default: [create_default_slot_16]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti51 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_15],
    					default: [create_default_slot_15]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti52 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_14],
    					default: [create_default_slot_14]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti53 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_13],
    					default: [create_default_slot_13]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti54 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_12],
    					default: [create_default_slot_12]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti55 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_11],
    					default: [create_default_slot_11]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti56 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_10],
    					default: [create_default_slot_10]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti57 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_9],
    					default: [create_default_slot_9]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti58 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_8],
    					default: [create_default_slot_8]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti59 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_7],
    					default: [create_default_slot_7]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti60 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_6],
    					default: [create_default_slot_6]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti61 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_5],
    					default: [create_default_slot_5]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti62 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_4],
    					default: [create_default_slot_4]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti63 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_3],
    					default: [create_default_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti64 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_2],
    					default: [create_default_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti65 = new ToggleConfetti({
    			props: {
    				$$slots: {
    					label: [create_label_slot_1],
    					default: [create_default_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	toggleconfetti66 = new ToggleConfetti({
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

    	confettionclick1 = new ConfettiOnClick({ $$inline: true });

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
    			t11 = text(" | ");
    			a1 = element("a");
    			a1.textContent = "REPL";
    			t13 = space();
    			h20 = element("h2");
    			h20.textContent = "Demo";
    			t15 = space();
    			p2 = element("p");
    			p2.textContent = "Click these buttons to see their effect. Most of these are not just a single toggle, they are a combination of multiple props. Don't worry we'll go over each one in the documentation further down the page!";
    			t17 = space();
    			div2 = element("div");
    			create_component(toggleconfetti0.$$.fragment);
    			t18 = space();
    			create_component(toggleconfetti1.$$.fragment);
    			t19 = space();
    			create_component(toggleconfetti2.$$.fragment);
    			t20 = space();
    			create_component(toggleconfetti3.$$.fragment);
    			t21 = space();
    			create_component(toggleconfetti4.$$.fragment);
    			t22 = space();
    			create_component(toggleconfetti5.$$.fragment);
    			t23 = space();
    			create_component(toggleconfetti6.$$.fragment);
    			t24 = space();
    			create_component(toggleconfetti7.$$.fragment);
    			t25 = space();
    			create_component(toggleconfetti8.$$.fragment);
    			t26 = space();
    			create_component(toggleconfetti9.$$.fragment);
    			t27 = space();
    			create_component(toggleconfetti10.$$.fragment);
    			t28 = space();
    			create_component(toggleconfetti11.$$.fragment);
    			t29 = space();
    			create_component(toggleconfetti12.$$.fragment);
    			t30 = space();
    			create_component(toggleconfetti13.$$.fragment);
    			t31 = space();
    			create_component(toggleconfetti14.$$.fragment);
    			t32 = space();
    			create_component(toggleconfetti15.$$.fragment);
    			t33 = space();
    			create_component(toggleconfetti16.$$.fragment);
    			t34 = space();
    			create_component(toggleconfetti17.$$.fragment);
    			t35 = space();
    			create_component(toggleconfetti18.$$.fragment);
    			t36 = space();
    			create_component(toggleconfetti19.$$.fragment);
    			t37 = space();
    			br0 = element("br");
    			t38 = space();
    			create_component(confettionclick0.$$.fragment);
    			t39 = space();
    			h21 = element("h2");
    			h21.textContent = "Installation";
    			t41 = space();
    			p3 = element("p");
    			p3.textContent = "Install using Yarn or NPM.";
    			t43 = space();
    			code0 = element("code");
    			t44 = text("yarn add ");
    			mark1 = element("mark");
    			mark1.textContent = "svelte-confetti";
    			t46 = space();
    			code1 = element("code");
    			t47 = text("npm install --save ");
    			mark2 = element("mark");
    			mark2.textContent = "svelte-confetti";
    			t49 = space();
    			p4 = element("p");
    			p4.textContent = "Include the component in your app.";
    			t51 = space();
    			code2 = element("code");
    			t52 = text("import { ");
    			mark3 = element("mark");
    			mark3.textContent = "Confetti";
    			t54 = text(" } from \"");
    			mark4 = element("mark");
    			mark4.textContent = "svelte-confetti";
    			t56 = text("\"");
    			t57 = space();
    			code3 = element("code");
    			t58 = text("<");
    			mark5 = element("mark");
    			mark5.textContent = "Confetti";
    			t60 = text(" />");
    			t61 = space();
    			h22 = element("h2");
    			h22.textContent = "Usage";
    			t63 = space();
    			mark6 = element("mark");
    			mark6.textContent = "The Confetti comes without the buttons you will see in these examples. The buttons are simply used to demonstrate the effect in these docs.";
    			t65 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t66 = text("The component in it's most basic form.\r\n\r\n\t\t\t");
    			div4 = element("div");
    			create_component(toggleconfetti20.$$.fragment);
    			t67 = space();
    			code4 = element("code");
    			code4.textContent = "<Confetti />";
    			t69 = space();
    			div14 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Spread";
    			t71 = space();
    			div13 = element("div");
    			t72 = text("The spread of confetti can be adjusted. The props ");
    			mark7 = element("mark");
    			mark7.textContent = "x";
    			t74 = text(" and ");
    			mark8 = element("mark");
    			mark8.textContent = "y";
    			t76 = text(" are used to determine how far the confetti spreads. For both values multipliers are used and these are to be supplied in an array of two with the lowest number first. For each confetti piece a random number between these two is picked. The higher the number the futher the spread. Negative numbers affect the direction.\r\n\r\n\t\t\t");
    			div7 = element("div");
    			create_component(toggleconfetti21.$$.fragment);
    			t77 = space();
    			code5 = element("code");
    			t78 = text("<Confetti ");
    			mark9 = element("mark");
    			mark9.textContent = "x";
    			t80 = text("={[-0.5, 0.5]} ");
    			mark10 = element("mark");
    			mark10.textContent = "y";
    			t82 = text("={[0.25, 1]} />");
    			t83 = space();
    			div8 = element("div");
    			create_component(toggleconfetti22.$$.fragment);
    			t84 = space();
    			code6 = element("code");
    			t85 = text("<Confetti ");
    			mark11 = element("mark");
    			mark11.textContent = "x";
    			t87 = text("={[-1, -0.25]} ");
    			mark12 = element("mark");
    			mark12.textContent = "y";
    			t89 = text("={[0, 0.5]} />");
    			t90 = space();
    			div9 = element("div");
    			create_component(toggleconfetti23.$$.fragment);
    			t91 = space();
    			code7 = element("code");
    			t92 = text("<Confetti ");
    			mark13 = element("mark");
    			mark13.textContent = "x";
    			t94 = text("={[0.25, 1]} ");
    			mark14 = element("mark");
    			mark14.textContent = "y";
    			t96 = text("={[0, 0.5]} />");
    			t97 = space();
    			div10 = element("div");
    			create_component(toggleconfetti24.$$.fragment);
    			t98 = space();
    			code8 = element("code");
    			t99 = text("<Confetti ");
    			mark15 = element("mark");
    			mark15.textContent = "x";
    			t101 = text("={[-0.25, 0.25]} ");
    			mark16 = element("mark");
    			mark16.textContent = "y";
    			t103 = text("={[0.75, 1.5]} />");
    			t104 = space();
    			div11 = element("div");
    			create_component(toggleconfetti25.$$.fragment);
    			t105 = space();
    			code9 = element("code");
    			t106 = text("<Confetti ");
    			mark17 = element("mark");
    			mark17.textContent = "x";
    			t108 = text("={[-0.25, 0.25]} ");
    			mark18 = element("mark");
    			mark18.textContent = "y";
    			t110 = text("={[-0.75, -0.25]} />");
    			t111 = space();
    			div12 = element("div");
    			create_component(toggleconfetti26.$$.fragment);
    			t112 = space();
    			code10 = element("code");
    			t113 = text("<Confetti ");
    			mark19 = element("mark");
    			mark19.textContent = "x";
    			t115 = text("={[-0.5, 0.5]} ");
    			mark20 = element("mark");
    			mark20.textContent = "y";
    			t117 = text("={[-0.5, -0.5]} />");
    			t118 = space();
    			div20 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Amount";
    			t120 = space();
    			div19 = element("div");
    			t121 = text("The amount of particles that are launched can be adjusted with the ");
    			mark21 = element("mark");
    			mark21.textContent = "amount";
    			t123 = text(" property. This should always be a whole number. Be careful with going too high as it may impact performance. It will depends on the device and other performance heavy elements on the page, but try and keep it below 500.\r\n\r\n\t\t\t");
    			div15 = element("div");
    			create_component(toggleconfetti27.$$.fragment);
    			t124 = space();
    			code11 = element("code");
    			t125 = text("<Confetti ");
    			mark22 = element("mark");
    			mark22.textContent = "amount";
    			t127 = text("=10 />");
    			t128 = space();
    			div16 = element("div");
    			create_component(toggleconfetti28.$$.fragment);
    			t129 = space();
    			code12 = element("code");
    			t130 = text("<Confetti ");
    			mark23 = element("mark");
    			mark23.textContent = "amount";
    			t132 = text("=50 />");
    			t133 = space();
    			div17 = element("div");
    			create_component(toggleconfetti29.$$.fragment);
    			t134 = space();
    			code13 = element("code");
    			t135 = text("<Confetti ");
    			mark24 = element("mark");
    			mark24.textContent = "amount";
    			t137 = text("=200 />");
    			t138 = space();
    			div18 = element("div");
    			create_component(toggleconfetti30.$$.fragment);
    			t139 = space();
    			code14 = element("code");
    			t140 = text("<Confetti ");
    			mark25 = element("mark");
    			mark25.textContent = "amount";
    			t142 = text("=500 />");
    			t143 = space();
    			div26 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Shape";
    			t145 = space();
    			div25 = element("div");
    			t146 = text("As you may have noticed from the previous buttons, the confetti tends to take on a fairly square shape. This can be mitigated a little bit by using the propery ");
    			mark26 = element("mark");
    			mark26.textContent = "cone";
    			t148 = text(". This will cause the confetti to launch in a more cone like shape which is especially nice when using lots of particles.\r\n\r\n\t\t\t");
    			div21 = element("div");
    			create_component(toggleconfetti31.$$.fragment);
    			t149 = space();
    			code15 = element("code");
    			code15.textContent = "<Confetti amount=200 />";
    			t151 = space();
    			div22 = element("div");
    			create_component(toggleconfetti32.$$.fragment);
    			t152 = space();
    			code16 = element("code");
    			t153 = text("<Confetti ");
    			mark27 = element("mark");
    			mark27.textContent = "cone";
    			t155 = text(" amount=200 />");
    			t156 = text("\r\n\r\n\t\t\tThis is especially effective when firing to the side, but we need to compensate with a larger x multiplier.\r\n\r\n\t\t\t");
    			div23 = element("div");
    			create_component(toggleconfetti33.$$.fragment);
    			t157 = space();
    			code17 = element("code");
    			code17.textContent = "<Confetti x={[0.25, 1]} y={[0, 0.5]} />";
    			t159 = space();
    			div24 = element("div");
    			create_component(toggleconfetti34.$$.fragment);
    			t160 = space();
    			code18 = element("code");
    			t161 = text("<Confetti ");
    			mark28 = element("mark");
    			mark28.textContent = "cone";
    			t163 = text(" x={[1, 2.5]} y={[0.25, 0.75]} />");
    			t164 = text("\r\n\r\n\t\t\tThe cones still have a fairly distinct cone shape to them, later on in these docs we will go over how to mitigate this.");
    			t165 = space();
    			div31 = element("div");
    			h33 = element("h3");
    			h33.textContent = "Size";
    			t167 = space();
    			div30 = element("div");
    			t168 = text("The size of the confetti pieces can be adjusted using the ");
    			mark29 = element("mark");
    			mark29.textContent = "size";
    			t170 = text(" property.\r\n\r\n\t\t\t");
    			div27 = element("div");
    			create_component(toggleconfetti35.$$.fragment);
    			t171 = space();
    			code19 = element("code");
    			t172 = text("<Confetti ");
    			mark30 = element("mark");
    			mark30.textContent = "size";
    			t174 = text("=2 />");
    			t175 = space();
    			div28 = element("div");
    			create_component(toggleconfetti36.$$.fragment);
    			t176 = space();
    			code20 = element("code");
    			t177 = text("<Confetti ");
    			mark31 = element("mark");
    			mark31.textContent = "size";
    			t179 = text("=30 />");
    			t180 = text("\r\n\r\n\t\t\tWe can also adjust the shape of the confetti pieces using the ");
    			mark32 = element("mark");
    			mark32.textContent = "rounded";
    			t182 = text(" property\r\n\r\n\t\t\t");
    			div29 = element("div");
    			create_component(toggleconfetti37.$$.fragment);
    			t183 = space();
    			code21 = element("code");
    			t184 = text("<Confetti ");
    			mark33 = element("mark");
    			mark33.textContent = "rounded";
    			t186 = text(" size=30 />");
    			t187 = space();
    			div38 = element("div");
    			h34 = element("h3");
    			h34.textContent = "Timing";
    			t189 = space();
    			div37 = element("div");
    			t190 = text("By default all confetti comes out at just about the same time. There is a little bit of variance but it appears instant. That's what a confetti cannon does. We can change when each piece is fired by adjusted the range of the ");
    			mark34 = element("mark");
    			mark34.textContent = "delay";
    			t192 = text(" property. The delay is given in milliseconds.\r\n\r\n\t\t\t");
    			div32 = element("div");
    			create_component(toggleconfetti38.$$.fragment);
    			t193 = space();
    			code22 = element("code");
    			t194 = text("<Confetti ");
    			mark35 = element("mark");
    			mark35.textContent = "delay";
    			t196 = text("={[0, 250]} />");
    			t197 = space();
    			div33 = element("div");
    			create_component(toggleconfetti39.$$.fragment);
    			t198 = space();
    			code23 = element("code");
    			t199 = text("<Confetti ");
    			mark36 = element("mark");
    			mark36.textContent = "delay";
    			t201 = text("={[0, 1500]} />");
    			t202 = text("\r\n\r\n\t\t\tWe can also opt to have the animation play infinitely by setting the ");
    			mark37 = element("mark");
    			mark37.textContent = "infinite";
    			t204 = text(" property, at this point the delay mostly has a effect only when spawning in for the first time. (Click the button again to toggle it off)\r\n\r\n\t\t\t");
    			div34 = element("div");
    			create_component(toggleconfetti40.$$.fragment);
    			t205 = space();
    			code24 = element("code");
    			t206 = text("<Confetti ");
    			mark38 = element("mark");
    			mark38.textContent = "infinite";
    			t208 = text(" />");
    			t209 = space();
    			div35 = element("div");
    			create_component(toggleconfetti41.$$.fragment);
    			t210 = space();
    			code25 = element("code");
    			t211 = text("<Confetti ");
    			mark39 = element("mark");
    			mark39.textContent = "infinite";
    			t213 = space();
    			mark40 = element("mark");
    			mark40.textContent = "delay";
    			t215 = text("={[0, 1500]} />");
    			t216 = text("\r\n\r\n\t\t\tAlternatively we can let the animation play out fully before repeating. For this we can use the ");
    			mark41 = element("mark");
    			mark41.textContent = "iterationCount";
    			t218 = text(" property. This is especially useful during development to tweak the confetti without having to reload the page or set up a button. This can be set to a number or to \"infinite\", basically anything that would be accepted by the animation-iteration-count property in CSS.\r\n\r\n\t\t\t");
    			div36 = element("div");
    			create_component(toggleconfetti42.$$.fragment);
    			t219 = space();
    			code26 = element("code");
    			t220 = text("<Confetti ");
    			mark42 = element("mark");
    			mark42.textContent = "iterationCount";
    			t222 = text("=infinite />");
    			t223 = space();
    			div46 = element("div");
    			h35 = element("h3");
    			h35.textContent = "Color";
    			t225 = space();
    			div45 = element("div");
    			t226 = text("You can adjust the colors of the confetti pieces in different ways. You can specify a hue using the ");
    			mark43 = element("mark");
    			mark43.textContent = "colorRange";
    			t228 = text(" property, which will use HSL colors with 75% saturation and 50% lightness. 0-360 is all colors, 75-175 would be only greens. Alternatively you can specifiy colors in an array using ");
    			mark44 = element("mark");
    			mark44.textContent = "colorArray";
    			t230 = text(". This can take any CSS value that would be accepted as the background property. RGB, HEX, HSL, but even gradients and images.\r\n\r\n\t\t\t");
    			div39 = element("div");
    			create_component(toggleconfetti43.$$.fragment);
    			t231 = space();
    			code27 = element("code");
    			t232 = text("<Confetti ");
    			mark45 = element("mark");
    			mark45.textContent = "colorRange";
    			t234 = text("={[75, 175]} />");
    			t235 = space();
    			div40 = element("div");
    			create_component(toggleconfetti44.$$.fragment);
    			t236 = space();
    			code28 = element("code");
    			t237 = text("<Confetti ");
    			mark46 = element("mark");
    			mark46.textContent = "colorArray";
    			t239 = text("={[\"#ffbe0b\", \"#fb5607\", \"#ff006e\", \"#8338ec\", \"#3a86ff\"]} />");
    			t240 = space();
    			div41 = element("div");
    			create_component(toggleconfetti45.$$.fragment);
    			t241 = space();
    			code29 = element("code");
    			t242 = text("<Confetti ");
    			mark47 = element("mark");
    			mark47.textContent = "colorArray";
    			t244 = text("={[\"var(--primary)\", \"rgba(0, 255, 0, 0.5)\", \"white\"]} />");
    			t245 = text("\r\n\r\n\t\t\tIt's not just colors though, we can input any value valid to the background css property. This includes gradients and images.\r\n\r\n\t\t\t");
    			div42 = element("div");
    			create_component(toggleconfetti46.$$.fragment);
    			t246 = space();
    			code30 = element("code");
    			t247 = text("<Confetti ");
    			mark48 = element("mark");
    			mark48.textContent = "colorArray";
    			t249 = text("={[\"linear-gradient(var(--primary), blue)\"]} />");
    			t250 = space();
    			div43 = element("div");
    			create_component(toggleconfetti47.$$.fragment);
    			t251 = space();
    			code31 = element("code");
    			t252 = text("<Confetti ");
    			mark49 = element("mark");
    			mark49.textContent = "colorArray";
    			t254 = text("={[\"url(https://svelte.dev/favicon.png)\", \"url(https://github.githubassets.com/favicons/favicon-dark.png)\"]} />");
    			t255 = text("\r\n\r\n\t\t\tOr we could set up a random color each time the component is mounted.\r\n\r\n\t\t\t");
    			div44 = element("div");
    			create_component(toggleconfetti48.$$.fragment);
    			t256 = space();
    			code32 = element("code");
    			t257 = text("<Confetti ");
    			mark50 = element("mark");
    			mark50.textContent = "colorArray";
    			t259 = text("={[`hsl(${Math.floor(Math.random() * 360)}, 75%, 50%)`]} />");
    			t260 = space();
    			div55 = element("div");
    			h36 = element("h3");
    			h36.textContent = "Gravity";
    			t262 = space();
    			div54 = element("div");
    			t263 = text("We can change how the confetti falls using the ");
    			mark51 = element("mark");
    			mark51.textContent = "fallDistance";
    			t265 = text(" property. We can make it fall faster, slow, or stop it from falling altogether. This property will accept any valid css property, except for 0.\r\n\r\n\t\t\t");
    			div47 = element("div");
    			create_component(toggleconfetti49.$$.fragment);
    			t266 = space();
    			code33 = element("code");
    			t267 = text("<Confetti ");
    			mark52 = element("mark");
    			mark52.textContent = "fallDistance";
    			t269 = text("=50px />");
    			t270 = space();
    			div48 = element("div");
    			create_component(toggleconfetti50.$$.fragment);
    			t271 = space();
    			code34 = element("code");
    			t272 = text("<Confetti ");
    			mark53 = element("mark");
    			mark53.textContent = "fallDistance";
    			t274 = text("=200px />");
    			t275 = space();
    			div49 = element("div");
    			create_component(toggleconfetti51.$$.fragment);
    			t276 = space();
    			code35 = element("code");
    			t277 = text("<Confetti ");
    			mark54 = element("mark");
    			mark54.textContent = "fallDistance";
    			t279 = text("=0px />");
    			t280 = text("\r\n\r\n\t\t\tWe can also disable gravity and air resistance altogether and make it travel at a constant speed by setting the ");
    			mark55 = element("mark");
    			mark55.textContent = "noGravity";
    			t282 = text(" property.\r\n\r\n\t\t\t");
    			div50 = element("div");
    			create_component(toggleconfetti52.$$.fragment);
    			t283 = space();
    			code36 = element("code");
    			t284 = text("<Confetti ");
    			mark56 = element("mark");
    			mark56.textContent = "noGravity";
    			t286 = text(" duration=500 />");
    			t287 = space();
    			div51 = element("div");
    			create_component(toggleconfetti53.$$.fragment);
    			t288 = space();
    			code37 = element("code");
    			t289 = text("<Confetti ");
    			mark57 = element("mark");
    			mark57.textContent = "noGravity";
    			t291 = text(" duration=500 x={[-0.5, 0.5]} y={[-0.5, 0.5]} />");
    			t292 = text("\r\n\r\n\t\t\tWe can set how far the particles spread horizontally before and after the peak using the ");
    			mark58 = element("mark");
    			mark58.textContent = "xSpread";
    			t294 = text(" property. This expects a number between 0 and 1 but you can set it higher or lower for some odd results.\r\n\r\n\t\t\t");
    			div52 = element("div");
    			create_component(toggleconfetti54.$$.fragment);
    			t295 = space();
    			code38 = element("code");
    			t296 = text("<Confetti ");
    			mark59 = element("mark");
    			mark59.textContent = "xSpread";
    			t298 = text("=0.1 />");
    			t299 = space();
    			div53 = element("div");
    			create_component(toggleconfetti55.$$.fragment);
    			t300 = space();
    			code39 = element("code");
    			t301 = text("<Confetti ");
    			mark60 = element("mark");
    			mark60.textContent = "xSpread";
    			t303 = text("=0.4 />");
    			t304 = space();
    			div74 = element("div");
    			h37 = element("h3");
    			h37.textContent = "Multiple components";
    			t306 = space();
    			div73 = element("div");
    			t307 = text("We can combine multiple Confetti components to create neat effects.");
    			br1 = element("br");
    			t308 = text("\r\n\t\t\tFor example we could combine multiple components each with different colors and different areas to create flags! ");
    			small0 = element("small");
    			small0.textContent = "(Blues aren't the actual flag colors to make it a little easier to see on dark backgrounds)";
    			t310 = space();
    			br2 = element("br");
    			br3 = element("br");
    			t311 = space();
    			div56 = element("div");
    			create_component(toggleconfetti56.$$.fragment);
    			t312 = space();
    			code40 = element("code");
    			t313 = text("<Confetti y={[1.25, 1.5]} x={[-1, 1]} colorArray={[\"#c8102e\"]} /> ");
    			br4 = element("br");
    			t314 = text("\r\n\t\t\t\t\t<Confetti  y={[1, 1.25]} x={[-1, 1]} colorArray={[\"white\"]} /> ");
    			br5 = element("br");
    			t315 = text("\r\n\t\t\t\t\t<Confetti  y={[0.75, 1]} x={[-1, 1]} colorArray={[\"#3350ec\"]} /> ");
    			br6 = element("br");
    			t316 = space();
    			br7 = element("br");
    			t317 = space();
    			div57 = element("div");
    			create_component(toggleconfetti57.$$.fragment);
    			t318 = space();
    			code41 = element("code");
    			t319 = text("<Confetti y={[0.75, 1.5]} x={[-1, 1]} colorArray={[\"#004b87\"]} amount=100 /> ");
    			br8 = element("br");
    			t320 = text("\r\n\t\t\t\t\t<Confetti y={[1.05, 1.20]} x={[-1, 1]} colorArray={[\"#ffcd00\"]} amount=50 /> ");
    			br9 = element("br");
    			t321 = text("\r\n\t\t\t\t\t<Confetti y={[0.75, 1.5]} x={[-0.5, -0.25]} colorArray={[\"#ffcd00\"]} amount=20 /> ");
    			br10 = element("br");
    			t322 = space();
    			br11 = element("br");
    			t323 = space();
    			div58 = element("div");
    			create_component(toggleconfetti58.$$.fragment);
    			t324 = space();
    			small1 = element("small");
    			small1.textContent = "This one is heavy! This uses 1015 effects, more than recommended, but it looks neat!";
    			t326 = space();
    			code42 = element("code");
    			t327 = text("<Confetti y={[1.20, 1.45]} x={[-0.95, -0.3]} colorArray={[\"white\"]} size=5 /> ");
    			br12 = element("br");
    			t328 = text("\r\n\t\t\t\t\t<Confetti y={[1.45, 1.5]} x={[-0.25, 1]} colorArray={[\"#bf0d3e\"]} amount=70 /> ");
    			br13 = element("br");
    			t329 = text("\r\n\t\t\t\t\t<Confetti y={[1.4, 1.45]} x={[-0.25, 1]} colorArray={[\"white\"]} amount=70 /> ");
    			br14 = element("br");
    			t330 = text("\r\n\t\t\t\t\t<Confetti y={[1.35, 1.4]} x={[-0.25, 1]} colorArray={[\"#bf0d3e\"]} amount=70 /> ");
    			br15 = element("br");
    			t331 = text("\r\n\t\t\t\t\t<Confetti y={[1.3, 1.35]} x={[-0.25, 1]} colorArray={[\"white\"]} amount=70 /> ");
    			br16 = element("br");
    			t332 = text("\r\n\t\t\t\t\t<Confetti y={[1.25, 1.3]} x={[-0.25, 1]} colorArray={[\"#bf0d3e\"]} amount=70 /> ");
    			br17 = element("br");
    			t333 = text("\r\n\t\t\t\t\t<Confetti y={[1.2, 1.25]} x={[-0.25, 1]} colorArray={[\"white\"]} amount=70 /> ");
    			br18 = element("br");
    			t334 = text("\r\n\t\t\t\t\t<Confetti y={[1.15, 1.2]} x={[-0.25, 1]} colorArray={[\"#bf0d3e\"]} amount=70 /> ");
    			br19 = element("br");
    			t335 = text("\r\n\t\t\t\t\t<Confetti y={[1.1, 1.15]} x={[-1, 1]} colorArray={[\"white\"]} amount=70 /> ");
    			br20 = element("br");
    			t336 = text("\r\n\t\t\t\t\t<Confetti y={[1.05, 1.1]} x={[-1, 1]} colorArray={[\"#bf0d3e\"]} amount=70 /> ");
    			br21 = element("br");
    			t337 = text("\r\n\t\t\t\t\t<Confetti y={[1, 1.05]} x={[-1, 1]} colorArray={[\"white\"]} amount=70 /> ");
    			br22 = element("br");
    			t338 = text("\r\n\t\t\t\t\t<Confetti y={[0.95, 1]} x={[-1, 1]} colorArray={[\"#bf0d3e\"]} amount=70 /> ");
    			br23 = element("br");
    			t339 = text("\r\n\t\t\t\t\t<Confetti y={[0.9, 0.95]} x={[-1, 1]} colorArray={[\"white\"]} amount=70 /> ");
    			br24 = element("br");
    			t340 = text("\r\n\t\t\t\t\t<Confetti y={[0.85, 0.9]} x={[-1, 1]} colorArray={[\"#bf0d3e\"]} amount=70 /> ");
    			br25 = element("br");
    			t341 = space();
    			br26 = element("br");
    			t342 = text("\r\n\r\n\t\t\tFlags are cool, but we can do plenty of other things. In this example we will \"feather\" the initial effect to give it a less defined shape. By default the effects have a fairly distinct shape to them which ruins the effect a little bit, especially when using lots of particles.\r\n\r\n\t\t\t");
    			div60 = element("div");
    			create_component(toggleconfetti59.$$.fragment);
    			t343 = space();
    			div59 = element("div");
    			code43 = element("code");
    			code43.textContent = "<Confetti y={[1.25, 1.5]} x={[-1, 1]} colorArray={[\"#c8102e\"]} />";
    			t345 = space();
    			div62 = element("div");
    			create_component(toggleconfetti60.$$.fragment);
    			t346 = space();
    			div61 = element("div");
    			code44 = element("code");
    			code44.textContent = "<Confetti x={[-0.5, 0.5]} />";
    			t348 = space();
    			code45 = element("code");
    			code45.textContent = "<Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} />";
    			t350 = space();
    			code46 = element("code");
    			code46.textContent = "<Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} />";
    			t352 = text("\r\n\r\n\t\t\tAnd with the cone property\r\n\r\n\t\t\t");
    			div64 = element("div");
    			create_component(toggleconfetti61.$$.fragment);
    			t353 = space();
    			div63 = element("div");
    			code47 = element("code");
    			code47.textContent = "<Confetti cone amount=70 x={[-0.5, 0.5]} />";
    			t355 = space();
    			div66 = element("div");
    			create_component(toggleconfetti62.$$.fragment);
    			t356 = space();
    			div65 = element("div");
    			code48 = element("code");
    			code48.textContent = "<Confetti cone x={[-0.5, 0.5]} />";
    			t358 = space();
    			code49 = element("code");
    			code49.textContent = "<Confetti cone amount=10 x={[-0.75, -0.4]} y={[0.15, 0.75]} />";
    			t360 = space();
    			code50 = element("code");
    			code50.textContent = "<Confetti cone amount=10 x={[0.4, 0.75]} y={[0.15, 0.75]} />";
    			t362 = text("\r\n\r\n\t\t\tWe can also combine this with a large delay to mitigate the effect further, but it makes it less cannon-y.\r\n\r\n\t\t\t");
    			div68 = element("div");
    			create_component(toggleconfetti63.$$.fragment);
    			t363 = space();
    			div67 = element("div");
    			code51 = element("code");
    			code51.textContent = "<Confetti x={[-0.5, 0.5]} delay={[0, 250]} />";
    			t365 = space();
    			code52 = element("code");
    			code52.textContent = "<Confetti amount=10 x={[-0.75, -0.3]} y={[0.15, 0.75]} delay={[0, 1000]} />";
    			t367 = space();
    			code53 = element("code");
    			code53.textContent = "<Confetti amount=10 x={[0.3, 0.75]} y={[0.15, 0.75]} delay={[0, 1000]} />";
    			t369 = text("\r\n\r\n\t\t\tWe could also combine multiple components to create animations.\r\n\r\n\t\t\t");
    			div70 = element("div");
    			create_component(toggleconfetti64.$$.fragment);
    			t370 = space();
    			div69 = element("div");
    			code54 = element("code");
    			code54.textContent = "<Confetti cone x={[-1, -0.25]} colorRange={[100, 200]} />";
    			t372 = space();
    			code55 = element("code");
    			code55.textContent = "<Confetti cone x={[-0.35, 0.35]} delay={[500, 550]} colorRange={[200, 300]} />";
    			t374 = space();
    			code56 = element("code");
    			code56.textContent = "<Confetti cone x={[0.25, 1]} delay={[250, 300]} colorRange={[100, 200]} />";
    			t376 = space();
    			code57 = element("code");
    			code57.textContent = "<Confetti cone amount=20 x={[-1, 1]} y={[0, 1]} delay={[0, 550]} colorRange={[200, 300]} />";
    			t378 = space();
    			div72 = element("div");
    			create_component(toggleconfetti65.$$.fragment);
    			t379 = space();
    			div71 = element("div");
    			code58 = element("code");
    			code58.textContent = "<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[0, 50]} duration=1000 colorRange={[0, 120]} />";
    			t381 = space();
    			code59 = element("code");
    			code59.textContent = "<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[550, 550]} duration=1000 colorRange={[120, 240]} />";
    			t383 = space();
    			code60 = element("code");
    			code60.textContent = "<Confetti noGravity x={[-1, 1]} y={[-1, 1]} delay={[1000, 1050]} duration=1000 colorRange={[240, 360]} />";
    			t385 = space();
    			div77 = element("div");
    			h38 = element("h3");
    			h38.textContent = "Styling it further";
    			t387 = space();
    			div76 = element("div");
    			t388 = text("We've now looked at all the different properties, but since this is just HTML and CSS you can style it further however you like. Let's look at some fullscreen examples. Having the effect fullscreen is not a simple toggle, but it is a simple bit of CSS.\r\n\r\n\t\t\t");
    			br27 = element("br");
    			br28 = element("br");
    			t389 = space();
    			div75 = element("div");
    			create_component(toggleconfetti66.$$.fragment);
    			t390 = space();
    			code61 = element("code");
    			t391 = text("<div style=\"");
    			br29 = element("br");
    			t392 = text("\r\n\t\t\t\t\t\tposition: fixed;");
    			br30 = element("br");
    			t393 = text("\r\n\t\t\t\t\t\ttop: -50px;");
    			br31 = element("br");
    			t394 = text("\r\n\t\t\t\t\t\tleft: 0;");
    			br32 = element("br");
    			t395 = text("\r\n\t\t\t\t\t\theight: 100vh;");
    			br33 = element("br");
    			t396 = text("\r\n\t\t\t\t\t\twidth: 100vw;");
    			br34 = element("br");
    			t397 = text("\r\n\t\t\t\t\t\tdisplay: flex;");
    			br35 = element("br");
    			t398 = text("\r\n\t\t\t\t\t\tjustify-content: center;");
    			br36 = element("br");
    			t399 = text("\r\n\t\t\t\t\t\toverflow: hidden;");
    			br37 = element("br");
    			t400 = text("\r\n\t\t\t\t\t\tpointer-events: none;\">");
    			br38 = element("br");
    			t401 = text("\r\n\t\t\t\t\t\t<Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration=5000 amount=200 fallDistance=\"100vh\" />\r\n\t\t\t\t\t\t");
    			br39 = element("br");
    			t402 = text("\r\n\t\t\t\t\t</div>");
    			t403 = space();
    			br40 = element("br");
    			t404 = text("\r\n\r\n\t\t\tThe element is fixed and placed just off screen so we can't see the confetti spawn in. The ");
    			mark61 = element("mark");
    			mark61.textContent = "fallDistance";
    			t406 = text(" property is set to ");
    			code62 = element("code");
    			code62.textContent = "100vh";
    			t408 = text(" so they cover the entire screen.\r\n\r\n\t\t\t");
    			br41 = element("br");
    			t409 = space();
    			br42 = element("br");
    			t410 = text("\r\n\r\n\t\t\tOne thing you may have noticed is that if you click a button the previous confetti disappears immediately and new ones spawn in. We could change this by creating a new component for each click. Check out the code for this example in the ");
    			a2 = element("a");
    			a2.textContent = "REPL";
    			t412 = text(".\r\n\r\n\t\t\t");
    			br43 = element("br");
    			t413 = space();
    			br44 = element("br");
    			t414 = space();
    			create_component(confettionclick1.$$.fragment);
    			t415 = space();
    			br45 = element("br");
    			t416 = space();
    			br46 = element("br");
    			t417 = space();
    			br47 = element("br");
    			t418 = space();
    			br48 = element("br");
    			t419 = text("\r\n\r\n\t\t\tYou could also further style the confetti itself. Don't like the animation? Do it yourself! Target the confetti with ");
    			code63 = element("code");
    			code63.textContent = ":global(.confetti)";
    			t421 = text(" and change the animation using ");
    			code64 = element("code");
    			code64.textContent = "animation-name";
    			t423 = text(", all values are set as css variables so you can easily use them yourself.");
    			t424 = space();
    			h23 = element("h2");
    			h23.textContent = "Properties";
    			t426 = space();
    			div95 = element("div");
    			p5 = element("p");
    			p5.textContent = "This is a list of all configurable properties.";
    			t428 = space();
    			div94 = element("div");
    			strong0 = element("strong");
    			strong0.textContent = "Property";
    			t430 = space();
    			strong1 = element("strong");
    			strong1.textContent = "Default";
    			t432 = space();
    			strong2 = element("strong");
    			strong2.textContent = "Description";
    			t434 = space();
    			code65 = element("code");
    			code65.textContent = "size";
    			t436 = space();
    			code66 = element("code");
    			code66.textContent = "10";
    			t438 = space();
    			div78 = element("div");
    			div78.textContent = "The max size in pixels of the individual confetti pieces.";
    			t440 = space();
    			code67 = element("code");
    			code67.textContent = "x";
    			t442 = space();
    			code68 = element("code");
    			code68.textContent = "[-0.5, 0.5]";
    			t444 = space();
    			div79 = element("div");
    			div79.textContent = "The max horizontal range of the confetti pieces. Negative is left, positive is right. [-1, 1] would mean maximum of 200px left and 200px right.";
    			t446 = space();
    			code69 = element("code");
    			code69.textContent = "y";
    			t448 = space();
    			code70 = element("code");
    			code70.textContent = "[0.25, 1]";
    			t450 = space();
    			div80 = element("div");
    			div80.textContent = "The max vertical range of the confetti pieces. Negative is down, positive is up. [-1, 1] would mean maximum of 200px down and 200px up.";
    			t452 = space();
    			code71 = element("code");
    			code71.textContent = "duration";
    			t454 = space();
    			code72 = element("code");
    			code72.textContent = "2000";
    			t456 = space();
    			div81 = element("div");
    			div81.textContent = "Duration of the animation for each individual piece.";
    			t458 = space();
    			code73 = element("code");
    			code73.textContent = "infinite";
    			t460 = space();
    			code74 = element("code");
    			code74.textContent = "false";
    			t462 = space();
    			div82 = element("div");
    			div82.textContent = "If set to true the animation will play indefinitely.";
    			t464 = space();
    			code75 = element("code");
    			code75.textContent = "delay";
    			t466 = space();
    			code76 = element("code");
    			code76.textContent = "[0, 50]";
    			t468 = space();
    			div83 = element("div");
    			div83.textContent = "Used to set a random delay for each piece. A large difference between each number will mean a longer spray time.";
    			t470 = space();
    			code77 = element("code");
    			code77.textContent = "colorRange";
    			t472 = space();
    			code78 = element("code");
    			code78.textContent = "[0, 360]";
    			t474 = space();
    			div84 = element("div");
    			div84.textContent = "Color range on the HSL color wheel. 0 to 360 is full RGB. 75 To 150 would be only green colors.";
    			t476 = space();
    			code79 = element("code");
    			code79.textContent = "colorArray";
    			t478 = space();
    			code80 = element("code");
    			code80.textContent = "[]";
    			t480 = space();
    			div85 = element("div");
    			div85.textContent = "Can be used to pick a random color from this array. Set just one array elements to have a single color. Accepts any viable css background property, including gradients and images.";
    			t482 = space();
    			code81 = element("code");
    			code81.textContent = "amount";
    			t484 = space();
    			code82 = element("code");
    			code82.textContent = "50";
    			t486 = space();
    			div86 = element("div");
    			div86.textContent = "Amount of particles spawned. The larger your spray the more pieces you might want. Be careful with too many as it might impact performance.";
    			t488 = space();
    			code83 = element("code");
    			code83.textContent = "iterationCount";
    			t490 = space();
    			code84 = element("code");
    			code84.textContent = "1";
    			t492 = space();
    			div87 = element("div");
    			div87.textContent = "How many times the animation will play before stopping. Is overwritten by the \"infinite\" property.";
    			t494 = space();
    			code85 = element("code");
    			code85.textContent = "fallDistance";
    			t496 = space();
    			code86 = element("code");
    			code86.textContent = "\"100px\"";
    			t498 = space();
    			div88 = element("div");
    			div88.textContent = "How far each piece falls. Accepts any css property, px, rem, vh, etc, but not 0.";
    			t500 = space();
    			code87 = element("code");
    			code87.textContent = "rounded";
    			t502 = space();
    			code88 = element("code");
    			code88.textContent = "false";
    			t504 = space();
    			div89 = element("div");
    			div89.textContent = "Set to true to make each confetti piece rounded.";
    			t506 = space();
    			code89 = element("code");
    			code89.textContent = "cone";
    			t508 = space();
    			code90 = element("code");
    			code90.textContent = "false";
    			t510 = space();
    			div90 = element("div");
    			div90.textContent = "Set to true to make the explosion appear in a cone like shape which might feel more realistic when dealing with a larger amount.";
    			t512 = space();
    			code91 = element("code");
    			code91.textContent = "noGravity";
    			t514 = space();
    			code92 = element("code");
    			code92.textContent = "false";
    			t516 = space();
    			div91 = element("div");
    			div91.textContent = "Set to true to make the particles accelerate at a constant speed without \"falling\" down. Give it a more explosion like effect.";
    			t518 = space();
    			code93 = element("code");
    			code93.textContent = "xSpread";
    			t520 = space();
    			code94 = element("code");
    			code94.textContent = "0.15";
    			t522 = space();
    			div92 = element("div");
    			div92.textContent = "A number from 0 to 1 that determines how far the particles spread horizontally. A low number will mean the x near the peak and the x near the end are similar.";
    			t524 = space();
    			code95 = element("code");
    			code95.textContent = "destroyOnComplete";
    			t526 = space();
    			code96 = element("code");
    			code96.textContent = "true";
    			t528 = space();
    			div93 = element("div");
    			div93.textContent = "By default the elements are removed when the animation is complete. Set to false to prevent this behaviour.";
    			t530 = space();
    			div96 = element("div");
    			t531 = text("Made by ");
    			a3 = element("a");
    			a3.textContent = "Mitchel Jager";
    			attr_dev(mark0, "class", "svelte-1lhfouh");
    			add_location(mark0, file, 19, 3, 397);
    			attr_dev(h1, "class", "svelte-1lhfouh");
    			add_location(h1, file, 10, 2, 232);
    			attr_dev(div0, "class", "header svelte-1lhfouh");
    			add_location(div0, file, 9, 1, 208);
    			add_location(em, file, 32, 190, 809);
    			attr_dev(p0, "class", "svelte-1lhfouh");
    			add_location(p0, file, 32, 2, 621);
    			attr_dev(div1, "class", "reduced-motion-only svelte-1lhfouh");
    			add_location(div1, file, 34, 2, 863);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "href", "https://github.com/Mitcheljager/svelte-confetti");
    			attr_dev(a0, "class", "svelte-1lhfouh");
    			add_location(a0, file, 38, 5, 1040);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "href", "https://svelte.dev/repl/21a63990161c481d97483c1f1d4de597");
    			attr_dev(a1, "class", "svelte-1lhfouh");
    			add_location(a1, file, 38, 92, 1127);
    			attr_dev(p1, "class", "svelte-1lhfouh");
    			add_location(p1, file, 38, 2, 1037);
    			attr_dev(h20, "class", "svelte-1lhfouh");
    			add_location(h20, file, 40, 2, 1228);
    			attr_dev(p2, "class", "svelte-1lhfouh");
    			add_location(p2, file, 42, 2, 1247);
    			attr_dev(div2, "class", "buttons svelte-1lhfouh");
    			add_location(div2, file, 44, 2, 1465);
    			add_location(br0, file, 172, 2, 4938);
    			attr_dev(h21, "class", "svelte-1lhfouh");
    			add_location(h21, file, 176, 2, 4973);
    			attr_dev(p3, "class", "svelte-1lhfouh");
    			add_location(p3, file, 178, 2, 5000);
    			attr_dev(mark1, "class", "svelte-1lhfouh");
    			add_location(mark1, file, 181, 12, 5072);
    			attr_dev(code0, "class", "well svelte-1lhfouh");
    			add_location(code0, file, 180, 2, 5039);
    			attr_dev(mark2, "class", "svelte-1lhfouh");
    			add_location(mark2, file, 185, 22, 5160);
    			attr_dev(code1, "class", "well svelte-1lhfouh");
    			add_location(code1, file, 184, 2, 5117);
    			attr_dev(p4, "class", "svelte-1lhfouh");
    			add_location(p4, file, 188, 2, 5205);
    			attr_dev(mark3, "class", "svelte-1lhfouh");
    			add_location(mark3, file, 191, 17, 5290);
    			attr_dev(mark4, "class", "svelte-1lhfouh");
    			add_location(mark4, file, 191, 52, 5325);
    			attr_dev(code2, "class", "well svelte-1lhfouh");
    			add_location(code2, file, 190, 2, 5252);
    			attr_dev(mark5, "class", "svelte-1lhfouh");
    			add_location(mark5, file, 195, 7, 5399);
    			attr_dev(code3, "class", "well svelte-1lhfouh");
    			add_location(code3, file, 194, 2, 5371);
    			attr_dev(div3, "class", "block svelte-1lhfouh");
    			add_location(div3, file, 31, 1, 598);
    			attr_dev(h22, "class", "svelte-1lhfouh");
    			add_location(h22, file, 199, 1, 5451);
    			attr_dev(mark6, "class", "svelte-1lhfouh");
    			add_location(mark6, file, 201, 1, 5470);
    			attr_dev(code4, "class", "svelte-1lhfouh");
    			add_location(code4, file, 214, 4, 5874);
    			attr_dev(div4, "class", "button-code-group svelte-1lhfouh");
    			add_location(div4, file, 207, 3, 5725);
    			attr_dev(div5, "class", "description svelte-1lhfouh");
    			add_location(div5, file, 204, 2, 5650);
    			attr_dev(div6, "class", "block svelte-1lhfouh");
    			add_location(div6, file, 203, 1, 5627);
    			attr_dev(h30, "class", "svelte-1lhfouh");
    			add_location(h30, file, 222, 2, 5976);
    			attr_dev(mark7, "class", "svelte-1lhfouh");
    			add_location(mark7, file, 225, 53, 6077);
    			attr_dev(mark8, "class", "svelte-1lhfouh");
    			add_location(mark8, file, 225, 72, 6096);
    			attr_dev(mark9, "class", "svelte-1lhfouh");
    			add_location(mark9, file, 235, 18, 6642);
    			attr_dev(mark10, "class", "svelte-1lhfouh");
    			add_location(mark10, file, 235, 57, 6681);
    			attr_dev(code5, "class", "svelte-1lhfouh");
    			add_location(code5, file, 234, 4, 6616);
    			attr_dev(div7, "class", "button-code-group svelte-1lhfouh");
    			add_location(div7, file, 227, 3, 6437);
    			attr_dev(mark11, "class", "svelte-1lhfouh");
    			add_location(mark11, file, 247, 18, 6955);
    			attr_dev(mark12, "class", "svelte-1lhfouh");
    			add_location(mark12, file, 247, 57, 6994);
    			attr_dev(code6, "class", "svelte-1lhfouh");
    			add_location(code6, file, 246, 4, 6929);
    			attr_dev(div8, "class", "button-code-group svelte-1lhfouh");
    			add_location(div8, file, 239, 3, 6754);
    			attr_dev(mark13, "class", "svelte-1lhfouh");
    			add_location(mark13, file, 259, 18, 7266);
    			attr_dev(mark14, "class", "svelte-1lhfouh");
    			add_location(mark14, file, 259, 55, 7303);
    			attr_dev(code7, "class", "svelte-1lhfouh");
    			add_location(code7, file, 258, 4, 7240);
    			attr_dev(div9, "class", "button-code-group svelte-1lhfouh");
    			add_location(div9, file, 251, 3, 7066);
    			attr_dev(mark15, "class", "svelte-1lhfouh");
    			add_location(mark15, file, 271, 18, 7579);
    			attr_dev(mark16, "class", "svelte-1lhfouh");
    			add_location(mark16, file, 271, 59, 7620);
    			attr_dev(code8, "class", "svelte-1lhfouh");
    			add_location(code8, file, 270, 4, 7553);
    			attr_dev(div10, "class", "button-code-group svelte-1lhfouh");
    			add_location(div10, file, 263, 3, 7375);
    			attr_dev(mark17, "class", "svelte-1lhfouh");
    			add_location(mark17, file, 283, 18, 7904);
    			attr_dev(mark18, "class", "svelte-1lhfouh");
    			add_location(mark18, file, 283, 59, 7945);
    			attr_dev(code9, "class", "svelte-1lhfouh");
    			add_location(code9, file, 282, 4, 7878);
    			attr_dev(div11, "class", "button-code-group svelte-1lhfouh");
    			add_location(div11, file, 275, 3, 7695);
    			attr_dev(mark19, "class", "svelte-1lhfouh");
    			add_location(mark19, file, 295, 18, 8233);
    			attr_dev(mark20, "class", "svelte-1lhfouh");
    			add_location(mark20, file, 295, 57, 8272);
    			attr_dev(code10, "class", "svelte-1lhfouh");
    			add_location(code10, file, 294, 4, 8207);
    			attr_dev(div12, "class", "button-code-group svelte-1lhfouh");
    			add_location(div12, file, 287, 3, 8023);
    			attr_dev(div13, "class", "description svelte-1lhfouh");
    			add_location(div13, file, 224, 2, 5997);
    			attr_dev(div14, "class", "block svelte-1lhfouh");
    			add_location(div14, file, 221, 1, 5953);
    			attr_dev(h31, "class", "svelte-1lhfouh");
    			add_location(h31, file, 302, 2, 8388);
    			attr_dev(mark21, "class", "svelte-1lhfouh");
    			add_location(mark21, file, 305, 70, 8506);
    			attr_dev(mark22, "class", "svelte-1lhfouh");
    			add_location(mark22, file, 315, 18, 8933);
    			attr_dev(code11, "class", "svelte-1lhfouh");
    			add_location(code11, file, 314, 4, 8907);
    			attr_dev(div15, "class", "button-code-group svelte-1lhfouh");
    			add_location(div15, file, 307, 3, 8752);
    			attr_dev(mark23, "class", "svelte-1lhfouh");
    			add_location(mark23, file, 327, 18, 9177);
    			attr_dev(code12, "class", "svelte-1lhfouh");
    			add_location(code12, file, 326, 4, 9151);
    			attr_dev(div16, "class", "button-code-group svelte-1lhfouh");
    			add_location(div16, file, 319, 3, 8992);
    			attr_dev(mark24, "class", "svelte-1lhfouh");
    			add_location(mark24, file, 339, 18, 9419);
    			attr_dev(code13, "class", "svelte-1lhfouh");
    			add_location(code13, file, 338, 4, 9393);
    			attr_dev(div17, "class", "button-code-group svelte-1lhfouh");
    			add_location(div17, file, 331, 3, 9236);
    			attr_dev(mark25, "class", "svelte-1lhfouh");
    			add_location(mark25, file, 351, 18, 9666);
    			attr_dev(code14, "class", "svelte-1lhfouh");
    			add_location(code14, file, 350, 4, 9640);
    			attr_dev(div18, "class", "button-code-group svelte-1lhfouh");
    			add_location(div18, file, 343, 3, 9479);
    			attr_dev(div19, "class", "description svelte-1lhfouh");
    			add_location(div19, file, 304, 2, 8409);
    			attr_dev(div20, "class", "block svelte-1lhfouh");
    			add_location(div20, file, 301, 1, 8365);
    			attr_dev(h32, "class", "svelte-1lhfouh");
    			add_location(h32, file, 358, 2, 9766);
    			attr_dev(mark26, "class", "svelte-1lhfouh");
    			add_location(mark26, file, 361, 163, 9976);
    			attr_dev(code15, "class", "svelte-1lhfouh");
    			add_location(code15, file, 370, 4, 10281);
    			attr_dev(div21, "class", "button-code-group svelte-1lhfouh");
    			add_location(div21, file, 363, 3, 10121);
    			attr_dev(mark27, "class", "svelte-1lhfouh");
    			add_location(mark27, file, 383, 18, 10542);
    			attr_dev(code16, "class", "svelte-1lhfouh");
    			add_location(code16, file, 382, 4, 10516);
    			attr_dev(div22, "class", "button-code-group svelte-1lhfouh");
    			add_location(div22, file, 375, 3, 10354);
    			attr_dev(code17, "class", "svelte-1lhfouh");
    			add_location(code17, file, 396, 4, 10895);
    			attr_dev(div23, "class", "button-code-group svelte-1lhfouh");
    			add_location(div23, file, 389, 3, 10721);
    			attr_dev(mark28, "class", "svelte-1lhfouh");
    			add_location(mark28, file, 409, 18, 11217);
    			attr_dev(code18, "class", "svelte-1lhfouh");
    			add_location(code18, file, 408, 4, 11191);
    			attr_dev(div24, "class", "button-code-group svelte-1lhfouh");
    			add_location(div24, file, 401, 3, 11004);
    			attr_dev(div25, "class", "description svelte-1lhfouh");
    			add_location(div25, file, 360, 2, 9786);
    			attr_dev(div26, "class", "block svelte-1lhfouh");
    			add_location(div26, file, 357, 1, 9743);
    			attr_dev(h33, "class", "svelte-1lhfouh");
    			add_location(h33, file, 418, 2, 11487);
    			attr_dev(mark29, "class", "svelte-1lhfouh");
    			add_location(mark29, file, 421, 61, 11594);
    			attr_dev(mark30, "class", "svelte-1lhfouh");
    			add_location(mark30, file, 431, 18, 11807);
    			attr_dev(code19, "class", "svelte-1lhfouh");
    			add_location(code19, file, 430, 4, 11781);
    			attr_dev(div27, "class", "button-code-group svelte-1lhfouh");
    			add_location(div27, file, 423, 3, 11628);
    			attr_dev(mark31, "class", "svelte-1lhfouh");
    			add_location(mark31, file, 443, 18, 12043);
    			attr_dev(code20, "class", "svelte-1lhfouh");
    			add_location(code20, file, 442, 4, 12017);
    			attr_dev(div28, "class", "button-code-group svelte-1lhfouh");
    			add_location(div28, file, 435, 3, 11863);
    			attr_dev(mark32, "class", "svelte-1lhfouh");
    			add_location(mark32, file, 447, 65, 12162);
    			attr_dev(mark33, "class", "svelte-1lhfouh");
    			add_location(mark33, file, 457, 18, 12387);
    			attr_dev(code21, "class", "svelte-1lhfouh");
    			add_location(code21, file, 456, 4, 12361);
    			attr_dev(div29, "class", "button-code-group svelte-1lhfouh");
    			add_location(div29, file, 449, 3, 12198);
    			attr_dev(div30, "class", "description svelte-1lhfouh");
    			add_location(div30, file, 420, 2, 11506);
    			attr_dev(div31, "class", "block svelte-1lhfouh");
    			add_location(div31, file, 417, 1, 11464);
    			attr_dev(h34, "class", "svelte-1lhfouh");
    			add_location(h34, file, 464, 2, 12492);
    			attr_dev(mark34, "class", "svelte-1lhfouh");
    			add_location(mark34, file, 467, 228, 12768);
    			attr_dev(mark35, "class", "svelte-1lhfouh");
    			add_location(mark35, file, 477, 18, 13035);
    			attr_dev(code22, "class", "svelte-1lhfouh");
    			add_location(code22, file, 476, 4, 13009);
    			attr_dev(div32, "class", "button-code-group svelte-1lhfouh");
    			add_location(div32, file, 469, 3, 12839);
    			attr_dev(mark36, "class", "svelte-1lhfouh");
    			add_location(mark36, file, 489, 18, 13307);
    			attr_dev(code23, "class", "svelte-1lhfouh");
    			add_location(code23, file, 488, 4, 13281);
    			attr_dev(div33, "class", "button-code-group svelte-1lhfouh");
    			add_location(div33, file, 481, 3, 13111);
    			attr_dev(mark37, "class", "svelte-1lhfouh");
    			add_location(mark37, file, 493, 72, 13453);
    			attr_dev(mark38, "class", "svelte-1lhfouh");
    			add_location(mark38, file, 503, 18, 13814);
    			attr_dev(code24, "class", "svelte-1lhfouh");
    			add_location(code24, file, 502, 4, 13788);
    			attr_dev(div34, "class", "button-code-group svelte-1lhfouh");
    			add_location(div34, file, 495, 3, 13619);
    			attr_dev(mark39, "class", "svelte-1lhfouh");
    			add_location(mark39, file, 515, 18, 14088);
    			attr_dev(mark40, "class", "svelte-1lhfouh");
    			add_location(mark40, file, 515, 40, 14110);
    			attr_dev(code25, "class", "svelte-1lhfouh");
    			add_location(code25, file, 514, 4, 14062);
    			attr_dev(div35, "class", "button-code-group svelte-1lhfouh");
    			add_location(div35, file, 507, 3, 13872);
    			attr_dev(mark41, "class", "svelte-1lhfouh");
    			add_location(mark41, file, 519, 99, 14283);
    			attr_dev(mark42, "class", "svelte-1lhfouh");
    			add_location(mark42, file, 529, 18, 14797);
    			attr_dev(code26, "class", "svelte-1lhfouh");
    			add_location(code26, file, 528, 4, 14771);
    			attr_dev(div36, "class", "button-code-group svelte-1lhfouh");
    			add_location(div36, file, 521, 3, 14586);
    			attr_dev(div37, "class", "description svelte-1lhfouh");
    			add_location(div37, file, 466, 2, 12513);
    			attr_dev(div38, "class", "block svelte-1lhfouh");
    			add_location(div38, file, 463, 1, 12469);
    			attr_dev(h35, "class", "svelte-1lhfouh");
    			add_location(h35, file, 536, 2, 14910);
    			attr_dev(mark43, "class", "svelte-1lhfouh");
    			add_location(mark43, file, 539, 103, 15060);
    			attr_dev(mark44, "class", "svelte-1lhfouh");
    			add_location(mark44, file, 539, 308, 15265);
    			attr_dev(mark45, "class", "svelte-1lhfouh");
    			add_location(mark45, file, 549, 18, 15623);
    			attr_dev(code27, "class", "svelte-1lhfouh");
    			add_location(code27, file, 548, 4, 15597);
    			attr_dev(div39, "class", "button-code-group svelte-1lhfouh");
    			add_location(div39, file, 541, 3, 15421);
    			attr_dev(mark46, "class", "svelte-1lhfouh");
    			add_location(mark46, file, 561, 18, 15947);
    			attr_dev(code28, "class", "svelte-1lhfouh");
    			add_location(code28, file, 560, 4, 15921);
    			attr_dev(div40, "class", "button-code-group svelte-1lhfouh");
    			add_location(div40, file, 553, 3, 15705);
    			attr_dev(mark47, "class", "svelte-1lhfouh");
    			add_location(mark47, file, 573, 18, 16324);
    			attr_dev(code29, "class", "svelte-1lhfouh");
    			add_location(code29, file, 572, 4, 16298);
    			attr_dev(div41, "class", "button-code-group svelte-1lhfouh");
    			add_location(div41, file, 565, 3, 16075);
    			attr_dev(mark48, "class", "svelte-1lhfouh");
    			add_location(mark48, file, 587, 18, 16819);
    			attr_dev(code30, "class", "svelte-1lhfouh");
    			add_location(code30, file, 586, 4, 16793);
    			attr_dev(div42, "class", "button-code-group svelte-1lhfouh");
    			add_location(div42, file, 579, 3, 16580);
    			attr_dev(mark49, "class", "svelte-1lhfouh");
    			add_location(mark49, file, 599, 18, 17234);
    			attr_dev(code31, "class", "svelte-1lhfouh");
    			add_location(code31, file, 598, 4, 17208);
    			attr_dev(div43, "class", "button-code-group svelte-1lhfouh");
    			add_location(div43, file, 591, 3, 16933);
    			attr_dev(mark50, "class", "svelte-1lhfouh");
    			add_location(mark50, file, 613, 18, 17729);
    			attr_dev(code32, "class", "svelte-1lhfouh");
    			add_location(code32, file, 612, 4, 17703);
    			attr_dev(div44, "class", "button-code-group svelte-1lhfouh");
    			add_location(div44, file, 605, 3, 17488);
    			attr_dev(div45, "class", "description svelte-1lhfouh");
    			add_location(div45, file, 538, 2, 14930);
    			attr_dev(div46, "class", "block svelte-1lhfouh");
    			add_location(div46, file, 535, 1, 14887);
    			attr_dev(h36, "class", "svelte-1lhfouh");
    			add_location(h36, file, 620, 2, 17905);
    			attr_dev(mark51, "class", "svelte-1lhfouh");
    			add_location(mark51, file, 623, 50, 18004);
    			attr_dev(mark52, "class", "svelte-1lhfouh");
    			add_location(mark52, file, 633, 18, 18375);
    			attr_dev(code33, "class", "svelte-1lhfouh");
    			add_location(code33, file, 632, 4, 18349);
    			attr_dev(div47, "class", "button-code-group svelte-1lhfouh");
    			add_location(div47, file, 625, 3, 18180);
    			attr_dev(mark53, "class", "svelte-1lhfouh");
    			add_location(mark53, file, 645, 18, 18638);
    			attr_dev(code34, "class", "svelte-1lhfouh");
    			add_location(code34, file, 644, 4, 18612);
    			attr_dev(div48, "class", "button-code-group svelte-1lhfouh");
    			add_location(div48, file, 637, 3, 18442);
    			attr_dev(mark54, "class", "svelte-1lhfouh");
    			add_location(mark54, file, 663, 18, 19062);
    			attr_dev(code35, "class", "svelte-1lhfouh");
    			add_location(code35, file, 662, 4, 19036);
    			attr_dev(div49, "class", "button-code-group svelte-1lhfouh");
    			add_location(div49, file, 649, 3, 18706);
    			attr_dev(mark55, "class", "svelte-1lhfouh");
    			add_location(mark55, file, 667, 115, 19240);
    			attr_dev(mark56, "class", "svelte-1lhfouh");
    			add_location(mark56, file, 677, 18, 19480);
    			attr_dev(code36, "class", "svelte-1lhfouh");
    			add_location(code36, file, 676, 4, 19454);
    			attr_dev(div50, "class", "button-code-group svelte-1lhfouh");
    			add_location(div50, file, 669, 3, 19279);
    			attr_dev(mark57, "class", "svelte-1lhfouh");
    			add_location(mark57, file, 689, 18, 19795);
    			attr_dev(code37, "class", "svelte-1lhfouh");
    			add_location(code37, file, 688, 4, 19769);
    			attr_dev(div51, "class", "button-code-group svelte-1lhfouh");
    			add_location(div51, file, 681, 3, 19552);
    			attr_dev(mark58, "class", "svelte-1lhfouh");
    			add_location(mark58, file, 693, 92, 20008);
    			attr_dev(mark59, "class", "svelte-1lhfouh");
    			add_location(mark59, file, 703, 18, 20332);
    			attr_dev(code38, "class", "svelte-1lhfouh");
    			add_location(code38, file, 702, 4, 20306);
    			attr_dev(div52, "class", "button-code-group svelte-1lhfouh");
    			add_location(div52, file, 695, 3, 20140);
    			attr_dev(mark60, "class", "svelte-1lhfouh");
    			add_location(mark60, file, 715, 18, 20585);
    			attr_dev(code39, "class", "svelte-1lhfouh");
    			add_location(code39, file, 714, 4, 20559);
    			attr_dev(div53, "class", "button-code-group svelte-1lhfouh");
    			add_location(div53, file, 707, 3, 20393);
    			attr_dev(div54, "class", "description svelte-1lhfouh");
    			add_location(div54, file, 622, 2, 17927);
    			attr_dev(div55, "class", "block svelte-1lhfouh");
    			add_location(div55, file, 619, 1, 17882);
    			attr_dev(h37, "class", "svelte-1lhfouh");
    			add_location(h37, file, 722, 2, 20686);
    			add_location(br1, file, 725, 70, 20817);
    			add_location(small0, file, 726, 116, 20939);
    			add_location(br2, file, 728, 3, 21052);
    			add_location(br3, file, 728, 7, 21056);
    			add_location(br4, file, 740, 107, 21507);
    			add_location(br5, file, 741, 104, 21617);
    			add_location(br6, file, 742, 106, 21729);
    			attr_dev(code40, "class", "well svelte-1lhfouh");
    			add_location(code40, file, 739, 4, 21379);
    			add_location(div56, file, 730, 3, 21067);
    			add_location(br7, file, 746, 3, 21764);
    			add_location(br8, file, 758, 118, 22272);
    			add_location(br9, file, 759, 118, 22396);
    			add_location(br10, file, 760, 123, 22525);
    			attr_dev(code41, "class", "well svelte-1lhfouh");
    			add_location(code41, file, 757, 4, 22133);
    			add_location(div57, file, 748, 3, 21775);
    			add_location(br11, file, 764, 3, 22560);
    			add_location(small1, file, 792, 4, 23957);
    			add_location(br12, file, 795, 119, 24204);
    			add_location(br13, file, 796, 120, 24330);
    			add_location(br14, file, 797, 118, 24454);
    			add_location(br15, file, 798, 120, 24580);
    			add_location(br16, file, 799, 118, 24704);
    			add_location(br17, file, 800, 120, 24830);
    			add_location(br18, file, 801, 118, 24954);
    			add_location(br19, file, 802, 120, 25080);
    			add_location(br20, file, 803, 115, 25201);
    			add_location(br21, file, 804, 117, 25324);
    			add_location(br22, file, 805, 113, 25443);
    			add_location(br23, file, 806, 115, 25564);
    			add_location(br24, file, 807, 115, 25685);
    			add_location(br25, file, 808, 117, 25808);
    			attr_dev(code42, "class", "well svelte-1lhfouh");
    			add_location(code42, file, 794, 4, 24064);
    			add_location(div58, file, 766, 3, 22571);
    			add_location(br26, file, 812, 3, 25843);
    			attr_dev(code43, "class", "svelte-1lhfouh");
    			add_location(code43, file, 824, 5, 26331);
    			add_location(div59, file, 823, 4, 26319);
    			attr_dev(div60, "class", "button-code-group svelte-1lhfouh");
    			add_location(div60, file, 816, 3, 26138);
    			attr_dev(code44, "class", "svelte-1lhfouh");
    			add_location(code44, file, 840, 5, 26795);
    			attr_dev(code45, "class", "svelte-1lhfouh");
    			add_location(code45, file, 843, 5, 26874);
    			attr_dev(code46, "class", "svelte-1lhfouh");
    			add_location(code46, file, 846, 5, 26992);
    			add_location(div61, file, 839, 4, 26783);
    			attr_dev(div62, "class", "button-code-group svelte-1lhfouh");
    			add_location(div62, file, 830, 3, 26490);
    			attr_dev(code47, "class", "svelte-1lhfouh");
    			add_location(code47, file, 862, 5, 27353);
    			add_location(div63, file, 861, 4, 27341);
    			attr_dev(div64, "class", "button-code-group svelte-1lhfouh");
    			add_location(div64, file, 854, 3, 27164);
    			attr_dev(code48, "class", "svelte-1lhfouh");
    			add_location(code48, file, 878, 5, 27795);
    			attr_dev(code49, "class", "svelte-1lhfouh");
    			add_location(code49, file, 881, 5, 27879);
    			attr_dev(code50, "class", "svelte-1lhfouh");
    			add_location(code50, file, 884, 5, 28002);
    			add_location(div65, file, 877, 4, 27783);
    			attr_dev(div66, "class", "button-code-group svelte-1lhfouh");
    			add_location(div66, file, 868, 3, 27470);
    			attr_dev(code51, "class", "svelte-1lhfouh");
    			add_location(code51, file, 902, 5, 28629);
    			attr_dev(code52, "class", "svelte-1lhfouh");
    			add_location(code52, file, 905, 5, 28735);
    			attr_dev(code53, "class", "svelte-1lhfouh");
    			add_location(code53, file, 908, 5, 28881);
    			add_location(div67, file, 901, 4, 28617);
    			attr_dev(div68, "class", "button-code-group svelte-1lhfouh");
    			add_location(div68, file, 892, 3, 28259);
    			attr_dev(code54, "class", "svelte-1lhfouh");
    			add_location(code54, file, 927, 5, 29588);
    			attr_dev(code55, "class", "svelte-1lhfouh");
    			add_location(code55, file, 930, 5, 29706);
    			attr_dev(code56, "class", "svelte-1lhfouh");
    			add_location(code56, file, 933, 5, 29855);
    			attr_dev(code57, "class", "svelte-1lhfouh");
    			add_location(code57, file, 936, 5, 30000);
    			add_location(div69, file, 926, 4, 29576);
    			attr_dev(div70, "class", "button-code-group svelte-1lhfouh");
    			add_location(div70, file, 916, 3, 29118);
    			attr_dev(code58, "class", "svelte-1lhfouh");
    			add_location(code58, file, 952, 5, 30674);
    			attr_dev(code59, "class", "svelte-1lhfouh");
    			add_location(code59, file, 955, 5, 30853);
    			attr_dev(code60, "class", "svelte-1lhfouh");
    			add_location(code60, file, 958, 5, 31037);
    			add_location(div71, file, 951, 4, 30662);
    			attr_dev(div72, "class", "button-code-group svelte-1lhfouh");
    			add_location(div72, file, 942, 3, 30195);
    			attr_dev(div73, "class", "description svelte-1lhfouh");
    			add_location(div73, file, 724, 2, 20720);
    			attr_dev(div74, "class", "block svelte-1lhfouh");
    			add_location(div74, file, 721, 1, 20663);
    			attr_dev(h38, "class", "svelte-1lhfouh");
    			add_location(h38, file, 967, 2, 31286);
    			add_location(br27, file, 972, 3, 31608);
    			add_location(br28, file, 972, 7, 31612);
    			add_location(br29, file, 984, 20, 32100);
    			add_location(br30, file, 985, 22, 32128);
    			add_location(br31, file, 986, 17, 32151);
    			add_location(br32, file, 987, 14, 32171);
    			add_location(br33, file, 988, 20, 32197);
    			add_location(br34, file, 989, 19, 32222);
    			add_location(br35, file, 990, 20, 32248);
    			add_location(br36, file, 991, 30, 32284);
    			add_location(br37, file, 992, 23, 32313);
    			add_location(br38, file, 993, 32, 32351);
    			add_location(br39, file, 995, 6, 32519);
    			attr_dev(code61, "class", "well svelte-1lhfouh");
    			add_location(code61, file, 983, 4, 32059);
    			add_location(div75, file, 974, 3, 31623);
    			add_location(br40, file, 1000, 3, 32573);
    			attr_dev(mark61, "class", "svelte-1lhfouh");
    			add_location(mark61, file, 1002, 94, 32675);
    			attr_dev(code62, "class", "inline svelte-1lhfouh");
    			add_location(code62, file, 1002, 139, 32720);
    			add_location(br41, file, 1004, 3, 32793);
    			add_location(br42, file, 1005, 3, 32802);
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "href", "https://svelte.dev/repl/21a63990161c481d97483c1f1d4de597");
    			attr_dev(a2, "class", "svelte-1lhfouh");
    			add_location(a2, file, 1007, 240, 33050);
    			add_location(br43, file, 1009, 3, 33149);
    			add_location(br44, file, 1010, 3, 33158);
    			add_location(br45, file, 1014, 3, 33195);
    			add_location(br46, file, 1015, 3, 33204);
    			add_location(br47, file, 1016, 3, 33213);
    			add_location(br48, file, 1017, 3, 33222);
    			attr_dev(code63, "class", "inline svelte-1lhfouh");
    			add_location(code63, file, 1019, 120, 33350);
    			attr_dev(code64, "class", "inline svelte-1lhfouh");
    			add_location(code64, file, 1019, 198, 33428);
    			attr_dev(div76, "class", "description svelte-1lhfouh");
    			add_location(div76, file, 969, 2, 31319);
    			attr_dev(div77, "class", "block svelte-1lhfouh");
    			add_location(div77, file, 966, 1, 31263);
    			attr_dev(h23, "class", "svelte-1lhfouh");
    			add_location(h23, file, 1023, 1, 33568);
    			attr_dev(p5, "class", "svelte-1lhfouh");
    			add_location(p5, file, 1026, 2, 33615);
    			attr_dev(strong0, "class", "svelte-1lhfouh");
    			add_location(strong0, file, 1029, 3, 33698);
    			attr_dev(strong1, "class", "svelte-1lhfouh");
    			add_location(strong1, file, 1029, 29, 33724);
    			attr_dev(strong2, "class", "svelte-1lhfouh");
    			add_location(strong2, file, 1029, 54, 33749);
    			attr_dev(code65, "class", "svelte-1lhfouh");
    			add_location(code65, file, 1031, 3, 33784);
    			attr_dev(code66, "class", "svelte-1lhfouh");
    			add_location(code66, file, 1031, 21, 33802);
    			add_location(div78, file, 1031, 37, 33818);
    			attr_dev(code67, "class", "svelte-1lhfouh");
    			add_location(code67, file, 1032, 3, 33891);
    			attr_dev(code68, "class", "svelte-1lhfouh");
    			add_location(code68, file, 1032, 18, 33906);
    			add_location(div79, file, 1032, 43, 33931);
    			attr_dev(code69, "class", "svelte-1lhfouh");
    			add_location(code69, file, 1033, 3, 34090);
    			attr_dev(code70, "class", "svelte-1lhfouh");
    			add_location(code70, file, 1033, 18, 34105);
    			add_location(div80, file, 1033, 41, 34128);
    			attr_dev(code71, "class", "svelte-1lhfouh");
    			add_location(code71, file, 1034, 3, 34279);
    			attr_dev(code72, "class", "svelte-1lhfouh");
    			add_location(code72, file, 1034, 25, 34301);
    			add_location(div81, file, 1034, 43, 34319);
    			attr_dev(code73, "class", "svelte-1lhfouh");
    			add_location(code73, file, 1035, 3, 34387);
    			attr_dev(code74, "class", "svelte-1lhfouh");
    			add_location(code74, file, 1035, 25, 34409);
    			add_location(div82, file, 1035, 44, 34428);
    			attr_dev(code75, "class", "svelte-1lhfouh");
    			add_location(code75, file, 1036, 3, 34496);
    			attr_dev(code76, "class", "svelte-1lhfouh");
    			add_location(code76, file, 1036, 22, 34515);
    			add_location(div83, file, 1036, 43, 34536);
    			attr_dev(code77, "class", "svelte-1lhfouh");
    			add_location(code77, file, 1037, 3, 34664);
    			attr_dev(code78, "class", "svelte-1lhfouh");
    			add_location(code78, file, 1037, 27, 34688);
    			add_location(div84, file, 1037, 49, 34710);
    			attr_dev(code79, "class", "svelte-1lhfouh");
    			add_location(code79, file, 1038, 3, 34821);
    			attr_dev(code80, "class", "svelte-1lhfouh");
    			add_location(code80, file, 1038, 27, 34845);
    			add_location(div85, file, 1038, 43, 34861);
    			attr_dev(code81, "class", "svelte-1lhfouh");
    			add_location(code81, file, 1039, 3, 35056);
    			attr_dev(code82, "class", "svelte-1lhfouh");
    			add_location(code82, file, 1039, 23, 35076);
    			add_location(div86, file, 1039, 39, 35092);
    			attr_dev(code83, "class", "svelte-1lhfouh");
    			add_location(code83, file, 1040, 3, 35247);
    			attr_dev(code84, "class", "svelte-1lhfouh");
    			add_location(code84, file, 1040, 31, 35275);
    			add_location(div87, file, 1040, 46, 35290);
    			attr_dev(code85, "class", "svelte-1lhfouh");
    			add_location(code85, file, 1041, 3, 35404);
    			attr_dev(code86, "class", "svelte-1lhfouh");
    			add_location(code86, file, 1041, 29, 35430);
    			add_location(div88, file, 1041, 50, 35451);
    			attr_dev(code87, "class", "svelte-1lhfouh");
    			add_location(code87, file, 1042, 3, 35547);
    			attr_dev(code88, "class", "svelte-1lhfouh");
    			add_location(code88, file, 1042, 24, 35568);
    			add_location(div89, file, 1042, 43, 35587);
    			attr_dev(code89, "class", "svelte-1lhfouh");
    			add_location(code89, file, 1043, 3, 35651);
    			attr_dev(code90, "class", "svelte-1lhfouh");
    			add_location(code90, file, 1043, 21, 35669);
    			add_location(div90, file, 1043, 40, 35688);
    			attr_dev(code91, "class", "svelte-1lhfouh");
    			add_location(code91, file, 1044, 3, 35832);
    			attr_dev(code92, "class", "svelte-1lhfouh");
    			add_location(code92, file, 1044, 26, 35855);
    			add_location(div91, file, 1044, 45, 35874);
    			attr_dev(code93, "class", "svelte-1lhfouh");
    			add_location(code93, file, 1045, 3, 36016);
    			attr_dev(code94, "class", "svelte-1lhfouh");
    			add_location(code94, file, 1045, 24, 36037);
    			add_location(div92, file, 1045, 42, 36055);
    			attr_dev(code95, "class", "svelte-1lhfouh");
    			add_location(code95, file, 1046, 3, 36229);
    			attr_dev(code96, "class", "svelte-1lhfouh");
    			add_location(code96, file, 1046, 34, 36260);
    			add_location(div93, file, 1046, 52, 36278);
    			attr_dev(div94, "class", "table svelte-1lhfouh");
    			add_location(div94, file, 1028, 2, 33674);
    			attr_dev(div95, "class", "block svelte-1lhfouh");
    			add_location(div95, file, 1025, 1, 33592);
    			attr_dev(a3, "href", "https://github.com/Mitcheljager");
    			attr_dev(a3, "class", "svelte-1lhfouh");
    			add_location(a3, file, 1051, 10, 36451);
    			attr_dev(div96, "class", "block svelte-1lhfouh");
    			add_location(div96, file, 1050, 1, 36420);
    			attr_dev(div97, "class", "wrapper svelte-1lhfouh");
    			add_location(div97, file, 8, 0, 184);
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
    			append_dev(p1, t11);
    			append_dev(p1, a1);
    			append_dev(div3, t13);
    			append_dev(div3, h20);
    			append_dev(div3, t15);
    			append_dev(div3, p2);
    			append_dev(div3, t17);
    			append_dev(div3, div2);
    			mount_component(toggleconfetti0, div2, null);
    			append_dev(div2, t18);
    			mount_component(toggleconfetti1, div2, null);
    			append_dev(div2, t19);
    			mount_component(toggleconfetti2, div2, null);
    			append_dev(div2, t20);
    			mount_component(toggleconfetti3, div2, null);
    			append_dev(div2, t21);
    			mount_component(toggleconfetti4, div2, null);
    			append_dev(div2, t22);
    			mount_component(toggleconfetti5, div2, null);
    			append_dev(div2, t23);
    			mount_component(toggleconfetti6, div2, null);
    			append_dev(div2, t24);
    			mount_component(toggleconfetti7, div2, null);
    			append_dev(div2, t25);
    			mount_component(toggleconfetti8, div2, null);
    			append_dev(div2, t26);
    			mount_component(toggleconfetti9, div2, null);
    			append_dev(div2, t27);
    			mount_component(toggleconfetti10, div2, null);
    			append_dev(div2, t28);
    			mount_component(toggleconfetti11, div2, null);
    			append_dev(div2, t29);
    			mount_component(toggleconfetti12, div2, null);
    			append_dev(div2, t30);
    			mount_component(toggleconfetti13, div2, null);
    			append_dev(div2, t31);
    			mount_component(toggleconfetti14, div2, null);
    			append_dev(div2, t32);
    			mount_component(toggleconfetti15, div2, null);
    			append_dev(div2, t33);
    			mount_component(toggleconfetti16, div2, null);
    			append_dev(div2, t34);
    			mount_component(toggleconfetti17, div2, null);
    			append_dev(div2, t35);
    			mount_component(toggleconfetti18, div2, null);
    			append_dev(div2, t36);
    			mount_component(toggleconfetti19, div2, null);
    			append_dev(div3, t37);
    			append_dev(div3, br0);
    			append_dev(div3, t38);
    			mount_component(confettionclick0, div3, null);
    			append_dev(div3, t39);
    			append_dev(div3, h21);
    			append_dev(div3, t41);
    			append_dev(div3, p3);
    			append_dev(div3, t43);
    			append_dev(div3, code0);
    			append_dev(code0, t44);
    			append_dev(code0, mark1);
    			append_dev(div3, t46);
    			append_dev(div3, code1);
    			append_dev(code1, t47);
    			append_dev(code1, mark2);
    			append_dev(div3, t49);
    			append_dev(div3, p4);
    			append_dev(div3, t51);
    			append_dev(div3, code2);
    			append_dev(code2, t52);
    			append_dev(code2, mark3);
    			append_dev(code2, t54);
    			append_dev(code2, mark4);
    			append_dev(code2, t56);
    			append_dev(div3, t57);
    			append_dev(div3, code3);
    			append_dev(code3, t58);
    			append_dev(code3, mark5);
    			append_dev(code3, t60);
    			append_dev(div97, t61);
    			append_dev(div97, h22);
    			append_dev(div97, t63);
    			append_dev(div97, mark6);
    			append_dev(div97, t65);
    			append_dev(div97, div6);
    			append_dev(div6, div5);
    			append_dev(div5, t66);
    			append_dev(div5, div4);
    			mount_component(toggleconfetti20, div4, null);
    			append_dev(div4, t67);
    			append_dev(div4, code4);
    			append_dev(div97, t69);
    			append_dev(div97, div14);
    			append_dev(div14, h30);
    			append_dev(div14, t71);
    			append_dev(div14, div13);
    			append_dev(div13, t72);
    			append_dev(div13, mark7);
    			append_dev(div13, t74);
    			append_dev(div13, mark8);
    			append_dev(div13, t76);
    			append_dev(div13, div7);
    			mount_component(toggleconfetti21, div7, null);
    			append_dev(div7, t77);
    			append_dev(div7, code5);
    			append_dev(code5, t78);
    			append_dev(code5, mark9);
    			append_dev(code5, t80);
    			append_dev(code5, mark10);
    			append_dev(code5, t82);
    			append_dev(div13, t83);
    			append_dev(div13, div8);
    			mount_component(toggleconfetti22, div8, null);
    			append_dev(div8, t84);
    			append_dev(div8, code6);
    			append_dev(code6, t85);
    			append_dev(code6, mark11);
    			append_dev(code6, t87);
    			append_dev(code6, mark12);
    			append_dev(code6, t89);
    			append_dev(div13, t90);
    			append_dev(div13, div9);
    			mount_component(toggleconfetti23, div9, null);
    			append_dev(div9, t91);
    			append_dev(div9, code7);
    			append_dev(code7, t92);
    			append_dev(code7, mark13);
    			append_dev(code7, t94);
    			append_dev(code7, mark14);
    			append_dev(code7, t96);
    			append_dev(div13, t97);
    			append_dev(div13, div10);
    			mount_component(toggleconfetti24, div10, null);
    			append_dev(div10, t98);
    			append_dev(div10, code8);
    			append_dev(code8, t99);
    			append_dev(code8, mark15);
    			append_dev(code8, t101);
    			append_dev(code8, mark16);
    			append_dev(code8, t103);
    			append_dev(div13, t104);
    			append_dev(div13, div11);
    			mount_component(toggleconfetti25, div11, null);
    			append_dev(div11, t105);
    			append_dev(div11, code9);
    			append_dev(code9, t106);
    			append_dev(code9, mark17);
    			append_dev(code9, t108);
    			append_dev(code9, mark18);
    			append_dev(code9, t110);
    			append_dev(div13, t111);
    			append_dev(div13, div12);
    			mount_component(toggleconfetti26, div12, null);
    			append_dev(div12, t112);
    			append_dev(div12, code10);
    			append_dev(code10, t113);
    			append_dev(code10, mark19);
    			append_dev(code10, t115);
    			append_dev(code10, mark20);
    			append_dev(code10, t117);
    			append_dev(div97, t118);
    			append_dev(div97, div20);
    			append_dev(div20, h31);
    			append_dev(div20, t120);
    			append_dev(div20, div19);
    			append_dev(div19, t121);
    			append_dev(div19, mark21);
    			append_dev(div19, t123);
    			append_dev(div19, div15);
    			mount_component(toggleconfetti27, div15, null);
    			append_dev(div15, t124);
    			append_dev(div15, code11);
    			append_dev(code11, t125);
    			append_dev(code11, mark22);
    			append_dev(code11, t127);
    			append_dev(div19, t128);
    			append_dev(div19, div16);
    			mount_component(toggleconfetti28, div16, null);
    			append_dev(div16, t129);
    			append_dev(div16, code12);
    			append_dev(code12, t130);
    			append_dev(code12, mark23);
    			append_dev(code12, t132);
    			append_dev(div19, t133);
    			append_dev(div19, div17);
    			mount_component(toggleconfetti29, div17, null);
    			append_dev(div17, t134);
    			append_dev(div17, code13);
    			append_dev(code13, t135);
    			append_dev(code13, mark24);
    			append_dev(code13, t137);
    			append_dev(div19, t138);
    			append_dev(div19, div18);
    			mount_component(toggleconfetti30, div18, null);
    			append_dev(div18, t139);
    			append_dev(div18, code14);
    			append_dev(code14, t140);
    			append_dev(code14, mark25);
    			append_dev(code14, t142);
    			append_dev(div97, t143);
    			append_dev(div97, div26);
    			append_dev(div26, h32);
    			append_dev(div26, t145);
    			append_dev(div26, div25);
    			append_dev(div25, t146);
    			append_dev(div25, mark26);
    			append_dev(div25, t148);
    			append_dev(div25, div21);
    			mount_component(toggleconfetti31, div21, null);
    			append_dev(div21, t149);
    			append_dev(div21, code15);
    			append_dev(div25, t151);
    			append_dev(div25, div22);
    			mount_component(toggleconfetti32, div22, null);
    			append_dev(div22, t152);
    			append_dev(div22, code16);
    			append_dev(code16, t153);
    			append_dev(code16, mark27);
    			append_dev(code16, t155);
    			append_dev(div25, t156);
    			append_dev(div25, div23);
    			mount_component(toggleconfetti33, div23, null);
    			append_dev(div23, t157);
    			append_dev(div23, code17);
    			append_dev(div25, t159);
    			append_dev(div25, div24);
    			mount_component(toggleconfetti34, div24, null);
    			append_dev(div24, t160);
    			append_dev(div24, code18);
    			append_dev(code18, t161);
    			append_dev(code18, mark28);
    			append_dev(code18, t163);
    			append_dev(div25, t164);
    			append_dev(div97, t165);
    			append_dev(div97, div31);
    			append_dev(div31, h33);
    			append_dev(div31, t167);
    			append_dev(div31, div30);
    			append_dev(div30, t168);
    			append_dev(div30, mark29);
    			append_dev(div30, t170);
    			append_dev(div30, div27);
    			mount_component(toggleconfetti35, div27, null);
    			append_dev(div27, t171);
    			append_dev(div27, code19);
    			append_dev(code19, t172);
    			append_dev(code19, mark30);
    			append_dev(code19, t174);
    			append_dev(div30, t175);
    			append_dev(div30, div28);
    			mount_component(toggleconfetti36, div28, null);
    			append_dev(div28, t176);
    			append_dev(div28, code20);
    			append_dev(code20, t177);
    			append_dev(code20, mark31);
    			append_dev(code20, t179);
    			append_dev(div30, t180);
    			append_dev(div30, mark32);
    			append_dev(div30, t182);
    			append_dev(div30, div29);
    			mount_component(toggleconfetti37, div29, null);
    			append_dev(div29, t183);
    			append_dev(div29, code21);
    			append_dev(code21, t184);
    			append_dev(code21, mark33);
    			append_dev(code21, t186);
    			append_dev(div97, t187);
    			append_dev(div97, div38);
    			append_dev(div38, h34);
    			append_dev(div38, t189);
    			append_dev(div38, div37);
    			append_dev(div37, t190);
    			append_dev(div37, mark34);
    			append_dev(div37, t192);
    			append_dev(div37, div32);
    			mount_component(toggleconfetti38, div32, null);
    			append_dev(div32, t193);
    			append_dev(div32, code22);
    			append_dev(code22, t194);
    			append_dev(code22, mark35);
    			append_dev(code22, t196);
    			append_dev(div37, t197);
    			append_dev(div37, div33);
    			mount_component(toggleconfetti39, div33, null);
    			append_dev(div33, t198);
    			append_dev(div33, code23);
    			append_dev(code23, t199);
    			append_dev(code23, mark36);
    			append_dev(code23, t201);
    			append_dev(div37, t202);
    			append_dev(div37, mark37);
    			append_dev(div37, t204);
    			append_dev(div37, div34);
    			mount_component(toggleconfetti40, div34, null);
    			append_dev(div34, t205);
    			append_dev(div34, code24);
    			append_dev(code24, t206);
    			append_dev(code24, mark38);
    			append_dev(code24, t208);
    			append_dev(div37, t209);
    			append_dev(div37, div35);
    			mount_component(toggleconfetti41, div35, null);
    			append_dev(div35, t210);
    			append_dev(div35, code25);
    			append_dev(code25, t211);
    			append_dev(code25, mark39);
    			append_dev(code25, t213);
    			append_dev(code25, mark40);
    			append_dev(code25, t215);
    			append_dev(div37, t216);
    			append_dev(div37, mark41);
    			append_dev(div37, t218);
    			append_dev(div37, div36);
    			mount_component(toggleconfetti42, div36, null);
    			append_dev(div36, t219);
    			append_dev(div36, code26);
    			append_dev(code26, t220);
    			append_dev(code26, mark42);
    			append_dev(code26, t222);
    			append_dev(div97, t223);
    			append_dev(div97, div46);
    			append_dev(div46, h35);
    			append_dev(div46, t225);
    			append_dev(div46, div45);
    			append_dev(div45, t226);
    			append_dev(div45, mark43);
    			append_dev(div45, t228);
    			append_dev(div45, mark44);
    			append_dev(div45, t230);
    			append_dev(div45, div39);
    			mount_component(toggleconfetti43, div39, null);
    			append_dev(div39, t231);
    			append_dev(div39, code27);
    			append_dev(code27, t232);
    			append_dev(code27, mark45);
    			append_dev(code27, t234);
    			append_dev(div45, t235);
    			append_dev(div45, div40);
    			mount_component(toggleconfetti44, div40, null);
    			append_dev(div40, t236);
    			append_dev(div40, code28);
    			append_dev(code28, t237);
    			append_dev(code28, mark46);
    			append_dev(code28, t239);
    			append_dev(div45, t240);
    			append_dev(div45, div41);
    			mount_component(toggleconfetti45, div41, null);
    			append_dev(div41, t241);
    			append_dev(div41, code29);
    			append_dev(code29, t242);
    			append_dev(code29, mark47);
    			append_dev(code29, t244);
    			append_dev(div45, t245);
    			append_dev(div45, div42);
    			mount_component(toggleconfetti46, div42, null);
    			append_dev(div42, t246);
    			append_dev(div42, code30);
    			append_dev(code30, t247);
    			append_dev(code30, mark48);
    			append_dev(code30, t249);
    			append_dev(div45, t250);
    			append_dev(div45, div43);
    			mount_component(toggleconfetti47, div43, null);
    			append_dev(div43, t251);
    			append_dev(div43, code31);
    			append_dev(code31, t252);
    			append_dev(code31, mark49);
    			append_dev(code31, t254);
    			append_dev(div45, t255);
    			append_dev(div45, div44);
    			mount_component(toggleconfetti48, div44, null);
    			append_dev(div44, t256);
    			append_dev(div44, code32);
    			append_dev(code32, t257);
    			append_dev(code32, mark50);
    			append_dev(code32, t259);
    			append_dev(div97, t260);
    			append_dev(div97, div55);
    			append_dev(div55, h36);
    			append_dev(div55, t262);
    			append_dev(div55, div54);
    			append_dev(div54, t263);
    			append_dev(div54, mark51);
    			append_dev(div54, t265);
    			append_dev(div54, div47);
    			mount_component(toggleconfetti49, div47, null);
    			append_dev(div47, t266);
    			append_dev(div47, code33);
    			append_dev(code33, t267);
    			append_dev(code33, mark52);
    			append_dev(code33, t269);
    			append_dev(div54, t270);
    			append_dev(div54, div48);
    			mount_component(toggleconfetti50, div48, null);
    			append_dev(div48, t271);
    			append_dev(div48, code34);
    			append_dev(code34, t272);
    			append_dev(code34, mark53);
    			append_dev(code34, t274);
    			append_dev(div54, t275);
    			append_dev(div54, div49);
    			mount_component(toggleconfetti51, div49, null);
    			append_dev(div49, t276);
    			append_dev(div49, code35);
    			append_dev(code35, t277);
    			append_dev(code35, mark54);
    			append_dev(code35, t279);
    			append_dev(div54, t280);
    			append_dev(div54, mark55);
    			append_dev(div54, t282);
    			append_dev(div54, div50);
    			mount_component(toggleconfetti52, div50, null);
    			append_dev(div50, t283);
    			append_dev(div50, code36);
    			append_dev(code36, t284);
    			append_dev(code36, mark56);
    			append_dev(code36, t286);
    			append_dev(div54, t287);
    			append_dev(div54, div51);
    			mount_component(toggleconfetti53, div51, null);
    			append_dev(div51, t288);
    			append_dev(div51, code37);
    			append_dev(code37, t289);
    			append_dev(code37, mark57);
    			append_dev(code37, t291);
    			append_dev(div54, t292);
    			append_dev(div54, mark58);
    			append_dev(div54, t294);
    			append_dev(div54, div52);
    			mount_component(toggleconfetti54, div52, null);
    			append_dev(div52, t295);
    			append_dev(div52, code38);
    			append_dev(code38, t296);
    			append_dev(code38, mark59);
    			append_dev(code38, t298);
    			append_dev(div54, t299);
    			append_dev(div54, div53);
    			mount_component(toggleconfetti55, div53, null);
    			append_dev(div53, t300);
    			append_dev(div53, code39);
    			append_dev(code39, t301);
    			append_dev(code39, mark60);
    			append_dev(code39, t303);
    			append_dev(div97, t304);
    			append_dev(div97, div74);
    			append_dev(div74, h37);
    			append_dev(div74, t306);
    			append_dev(div74, div73);
    			append_dev(div73, t307);
    			append_dev(div73, br1);
    			append_dev(div73, t308);
    			append_dev(div73, small0);
    			append_dev(div73, t310);
    			append_dev(div73, br2);
    			append_dev(div73, br3);
    			append_dev(div73, t311);
    			append_dev(div73, div56);
    			mount_component(toggleconfetti56, div56, null);
    			append_dev(div56, t312);
    			append_dev(div56, code40);
    			append_dev(code40, t313);
    			append_dev(code40, br4);
    			append_dev(code40, t314);
    			append_dev(code40, br5);
    			append_dev(code40, t315);
    			append_dev(code40, br6);
    			append_dev(div73, t316);
    			append_dev(div73, br7);
    			append_dev(div73, t317);
    			append_dev(div73, div57);
    			mount_component(toggleconfetti57, div57, null);
    			append_dev(div57, t318);
    			append_dev(div57, code41);
    			append_dev(code41, t319);
    			append_dev(code41, br8);
    			append_dev(code41, t320);
    			append_dev(code41, br9);
    			append_dev(code41, t321);
    			append_dev(code41, br10);
    			append_dev(div73, t322);
    			append_dev(div73, br11);
    			append_dev(div73, t323);
    			append_dev(div73, div58);
    			mount_component(toggleconfetti58, div58, null);
    			append_dev(div58, t324);
    			append_dev(div58, small1);
    			append_dev(div58, t326);
    			append_dev(div58, code42);
    			append_dev(code42, t327);
    			append_dev(code42, br12);
    			append_dev(code42, t328);
    			append_dev(code42, br13);
    			append_dev(code42, t329);
    			append_dev(code42, br14);
    			append_dev(code42, t330);
    			append_dev(code42, br15);
    			append_dev(code42, t331);
    			append_dev(code42, br16);
    			append_dev(code42, t332);
    			append_dev(code42, br17);
    			append_dev(code42, t333);
    			append_dev(code42, br18);
    			append_dev(code42, t334);
    			append_dev(code42, br19);
    			append_dev(code42, t335);
    			append_dev(code42, br20);
    			append_dev(code42, t336);
    			append_dev(code42, br21);
    			append_dev(code42, t337);
    			append_dev(code42, br22);
    			append_dev(code42, t338);
    			append_dev(code42, br23);
    			append_dev(code42, t339);
    			append_dev(code42, br24);
    			append_dev(code42, t340);
    			append_dev(code42, br25);
    			append_dev(div73, t341);
    			append_dev(div73, br26);
    			append_dev(div73, t342);
    			append_dev(div73, div60);
    			mount_component(toggleconfetti59, div60, null);
    			append_dev(div60, t343);
    			append_dev(div60, div59);
    			append_dev(div59, code43);
    			append_dev(div73, t345);
    			append_dev(div73, div62);
    			mount_component(toggleconfetti60, div62, null);
    			append_dev(div62, t346);
    			append_dev(div62, div61);
    			append_dev(div61, code44);
    			append_dev(div61, t348);
    			append_dev(div61, code45);
    			append_dev(div61, t350);
    			append_dev(div61, code46);
    			append_dev(div73, t352);
    			append_dev(div73, div64);
    			mount_component(toggleconfetti61, div64, null);
    			append_dev(div64, t353);
    			append_dev(div64, div63);
    			append_dev(div63, code47);
    			append_dev(div73, t355);
    			append_dev(div73, div66);
    			mount_component(toggleconfetti62, div66, null);
    			append_dev(div66, t356);
    			append_dev(div66, div65);
    			append_dev(div65, code48);
    			append_dev(div65, t358);
    			append_dev(div65, code49);
    			append_dev(div65, t360);
    			append_dev(div65, code50);
    			append_dev(div73, t362);
    			append_dev(div73, div68);
    			mount_component(toggleconfetti63, div68, null);
    			append_dev(div68, t363);
    			append_dev(div68, div67);
    			append_dev(div67, code51);
    			append_dev(div67, t365);
    			append_dev(div67, code52);
    			append_dev(div67, t367);
    			append_dev(div67, code53);
    			append_dev(div73, t369);
    			append_dev(div73, div70);
    			mount_component(toggleconfetti64, div70, null);
    			append_dev(div70, t370);
    			append_dev(div70, div69);
    			append_dev(div69, code54);
    			append_dev(div69, t372);
    			append_dev(div69, code55);
    			append_dev(div69, t374);
    			append_dev(div69, code56);
    			append_dev(div69, t376);
    			append_dev(div69, code57);
    			append_dev(div73, t378);
    			append_dev(div73, div72);
    			mount_component(toggleconfetti65, div72, null);
    			append_dev(div72, t379);
    			append_dev(div72, div71);
    			append_dev(div71, code58);
    			append_dev(div71, t381);
    			append_dev(div71, code59);
    			append_dev(div71, t383);
    			append_dev(div71, code60);
    			append_dev(div97, t385);
    			append_dev(div97, div77);
    			append_dev(div77, h38);
    			append_dev(div77, t387);
    			append_dev(div77, div76);
    			append_dev(div76, t388);
    			append_dev(div76, br27);
    			append_dev(div76, br28);
    			append_dev(div76, t389);
    			append_dev(div76, div75);
    			mount_component(toggleconfetti66, div75, null);
    			append_dev(div75, t390);
    			append_dev(div75, code61);
    			append_dev(code61, t391);
    			append_dev(code61, br29);
    			append_dev(code61, t392);
    			append_dev(code61, br30);
    			append_dev(code61, t393);
    			append_dev(code61, br31);
    			append_dev(code61, t394);
    			append_dev(code61, br32);
    			append_dev(code61, t395);
    			append_dev(code61, br33);
    			append_dev(code61, t396);
    			append_dev(code61, br34);
    			append_dev(code61, t397);
    			append_dev(code61, br35);
    			append_dev(code61, t398);
    			append_dev(code61, br36);
    			append_dev(code61, t399);
    			append_dev(code61, br37);
    			append_dev(code61, t400);
    			append_dev(code61, br38);
    			append_dev(code61, t401);
    			append_dev(code61, br39);
    			append_dev(code61, t402);
    			append_dev(div76, t403);
    			append_dev(div76, br40);
    			append_dev(div76, t404);
    			append_dev(div76, mark61);
    			append_dev(div76, t406);
    			append_dev(div76, code62);
    			append_dev(div76, t408);
    			append_dev(div76, br41);
    			append_dev(div76, t409);
    			append_dev(div76, br42);
    			append_dev(div76, t410);
    			append_dev(div76, a2);
    			append_dev(div76, t412);
    			append_dev(div76, br43);
    			append_dev(div76, t413);
    			append_dev(div76, br44);
    			append_dev(div76, t414);
    			mount_component(confettionclick1, div76, null);
    			append_dev(div76, t415);
    			append_dev(div76, br45);
    			append_dev(div76, t416);
    			append_dev(div76, br46);
    			append_dev(div76, t417);
    			append_dev(div76, br47);
    			append_dev(div76, t418);
    			append_dev(div76, br48);
    			append_dev(div76, t419);
    			append_dev(div76, code63);
    			append_dev(div76, t421);
    			append_dev(div76, code64);
    			append_dev(div76, t423);
    			append_dev(div97, t424);
    			append_dev(div97, h23);
    			append_dev(div97, t426);
    			append_dev(div97, div95);
    			append_dev(div95, p5);
    			append_dev(div95, t428);
    			append_dev(div95, div94);
    			append_dev(div94, strong0);
    			append_dev(div94, t430);
    			append_dev(div94, strong1);
    			append_dev(div94, t432);
    			append_dev(div94, strong2);
    			append_dev(div94, t434);
    			append_dev(div94, code65);
    			append_dev(div94, t436);
    			append_dev(div94, code66);
    			append_dev(div94, t438);
    			append_dev(div94, div78);
    			append_dev(div94, t440);
    			append_dev(div94, code67);
    			append_dev(div94, t442);
    			append_dev(div94, code68);
    			append_dev(div94, t444);
    			append_dev(div94, div79);
    			append_dev(div94, t446);
    			append_dev(div94, code69);
    			append_dev(div94, t448);
    			append_dev(div94, code70);
    			append_dev(div94, t450);
    			append_dev(div94, div80);
    			append_dev(div94, t452);
    			append_dev(div94, code71);
    			append_dev(div94, t454);
    			append_dev(div94, code72);
    			append_dev(div94, t456);
    			append_dev(div94, div81);
    			append_dev(div94, t458);
    			append_dev(div94, code73);
    			append_dev(div94, t460);
    			append_dev(div94, code74);
    			append_dev(div94, t462);
    			append_dev(div94, div82);
    			append_dev(div94, t464);
    			append_dev(div94, code75);
    			append_dev(div94, t466);
    			append_dev(div94, code76);
    			append_dev(div94, t468);
    			append_dev(div94, div83);
    			append_dev(div94, t470);
    			append_dev(div94, code77);
    			append_dev(div94, t472);
    			append_dev(div94, code78);
    			append_dev(div94, t474);
    			append_dev(div94, div84);
    			append_dev(div94, t476);
    			append_dev(div94, code79);
    			append_dev(div94, t478);
    			append_dev(div94, code80);
    			append_dev(div94, t480);
    			append_dev(div94, div85);
    			append_dev(div94, t482);
    			append_dev(div94, code81);
    			append_dev(div94, t484);
    			append_dev(div94, code82);
    			append_dev(div94, t486);
    			append_dev(div94, div86);
    			append_dev(div94, t488);
    			append_dev(div94, code83);
    			append_dev(div94, t490);
    			append_dev(div94, code84);
    			append_dev(div94, t492);
    			append_dev(div94, div87);
    			append_dev(div94, t494);
    			append_dev(div94, code85);
    			append_dev(div94, t496);
    			append_dev(div94, code86);
    			append_dev(div94, t498);
    			append_dev(div94, div88);
    			append_dev(div94, t500);
    			append_dev(div94, code87);
    			append_dev(div94, t502);
    			append_dev(div94, code88);
    			append_dev(div94, t504);
    			append_dev(div94, div89);
    			append_dev(div94, t506);
    			append_dev(div94, code89);
    			append_dev(div94, t508);
    			append_dev(div94, code90);
    			append_dev(div94, t510);
    			append_dev(div94, div90);
    			append_dev(div94, t512);
    			append_dev(div94, code91);
    			append_dev(div94, t514);
    			append_dev(div94, code92);
    			append_dev(div94, t516);
    			append_dev(div94, div91);
    			append_dev(div94, t518);
    			append_dev(div94, code93);
    			append_dev(div94, t520);
    			append_dev(div94, code94);
    			append_dev(div94, t522);
    			append_dev(div94, div92);
    			append_dev(div94, t524);
    			append_dev(div94, code95);
    			append_dev(div94, t526);
    			append_dev(div94, code96);
    			append_dev(div94, t528);
    			append_dev(div94, div93);
    			append_dev(div97, t530);
    			append_dev(div97, div96);
    			append_dev(div96, t531);
    			append_dev(div96, a3);
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
    			const toggleconfetti65_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti65_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti65.$set(toggleconfetti65_changes);
    			const toggleconfetti66_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				toggleconfetti66_changes.$$scope = { dirty, ctx };
    			}

    			toggleconfetti66.$set(toggleconfetti66_changes);
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
    			transition_in(confettionclick0.$$.fragment, local);
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
    			transition_in(toggleconfetti65.$$.fragment, local);
    			transition_in(toggleconfetti66.$$.fragment, local);
    			transition_in(confettionclick1.$$.fragment, local);
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
    			transition_out(confettionclick0.$$.fragment, local);
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
    			transition_out(toggleconfetti65.$$.fragment, local);
    			transition_out(toggleconfetti66.$$.fragment, local);
    			transition_out(confettionclick1.$$.fragment, local);
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
    			destroy_component(confettionclick0);
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
    			destroy_component(toggleconfetti65);
    			destroy_component(toggleconfetti66);
    			destroy_component(confettionclick1);
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

    	$$self.$capture_state = () => ({
    		Confetti,
    		ToggleConfetti,
    		ConfettiOnClick
    	});

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
