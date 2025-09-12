# Event Listener Memory Leaks

Event listener memory leaks are among the most common causes of memory leaks in web applications and GUI frameworks. They occur when event listeners are attached but never properly removed, causing DOM elements, components, or objects to remain in memory indefinitely.

## What are Event Listener Memory Leaks?

Event listener memory leaks happen when:

1. **Event listeners are not removed** when components are destroyed
2. **Anonymous functions** are used as event handlers (can't be removed)
3. **Circular references** exist between DOM elements and handlers
4. **Parent-child relationships** prevent garbage collection
5. **Global event listeners** accumulate over time

## How Event Listener Memory Leaks Occur

### JavaScript/Node.js Example

```javascript
// BAD: Anonymous listeners that can't be removed
function attachBadListeners() {
    const elements = document.querySelectorAll('.item');

    elements.forEach(element => {
        element.addEventListener('click', function(event) {
            console.log('Clicked:', event.target.id);
        });
    });
}

// BAD: EventEmitter listeners that accumulate
const EventEmitter = require('events');

class BadDataProcessor extends EventEmitter {
    addDataHandler() {
        this.on('data', (item) => {
            this.data.push(item); // Accumulates listeners
        });
    }
}

// GOOD: Named functions that can be removed
function attachGoodListeners() {
    const elements = document.querySelectorAll('.item');

    function handleClick(event) {
        console.log('Clicked:', event.target.id);
    }

    elements.forEach(element => {
        element.addEventListener('click', handleClick);
        element._handlers = { handleClick };
    });
}

function removeGoodListeners() {
    const elements = document.querySelectorAll('.item');
    elements.forEach(element => {
        if (element._handlers) {
            element.removeEventListener('click', element._handlers.handleClick);
            delete element._handlers;
        }
    });
}
```

### Python Example

```python
# BAD: Event listeners that accumulate
import tkinter as tk
from threading import Event

class BadEventHandler:
    def __init__(self):
        self.root = tk.Tk()
        self.listeners = []

    def add_listener(self, event_type, callback):
        # Accumulates listeners without cleanup
        self.root.bind(event_type, callback)
        self.listeners.append((event_type, callback))

    def handle_click(self, event):
        print(f"Clicked: {event.x}, {event.y}")

# GOOD: Proper listener management
class GoodEventHandler:
    def __init__(self):
        self.root = tk.Tk()
        self.listeners = {}

    def add_listener(self, event_type, callback):
        if event_type in self.listeners:
            self.remove_listener(event_type)

        self.root.bind(event_type, callback)
        self.listeners[event_type] = callback

    def remove_listener(self, event_type):
        if event_type in self.listeners:
            self.root.unbind(event_type)
            del self.listeners[event_type]

    def cleanup(self):
        for event_type in list(self.listeners.keys()):
            self.remove_listener(event_type)
        self.root.destroy()
```

### Java Example

```java
// BAD: Swing listeners without cleanup
import javax.swing.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;

public class BadEventManager {
    private JButton button;
    private List<ActionListener> listeners = new ArrayList<>();

    public void addListener(ActionListener listener) {
        button.addActionListener(listener); // Never removed
        listeners.add(listener);
    }

    public void processEvents() {
        for (int i = 0; i < 1000; i++) {
            addListener(e -> System.out.println("Event " + i));
        }
    }
}

// GOOD: Proper listener cleanup
public class GoodEventManager {
    private JButton button;
    private List<ActionListener> listeners = new ArrayList<>();

    public void addListener(ActionListener listener) {
        button.addActionListener(listener);
        listeners.add(listener);
    }

    public void removeListener(ActionListener listener) {
        button.removeActionListener(listener);
        listeners.remove(listener);
    }

    public void cleanup() {
        for (ActionListener listener : listeners) {
            button.removeActionListener(listener);
        }
        listeners.clear();
    }
}
```

### Go Example

```go
// BAD: Event handlers that accumulate
package main

import (
    "context"
    "sync"
)

type BadEventManager struct {
    handlers map[string][]func()
    mu       sync.RWMutex
}

func (em *BadEventManager) AddHandler(event string, handler func()) {
    em.mu.Lock()
    defer em.mu.Unlock()
    em.handlers[event] = append(em.handlers[event], handler)
    // Handlers never removed
}

func (em *BadEventManager) EmitEvent(event string) {
    em.mu.RLock()
    defer em.mu.RUnlock()
    for _, handler := range em.handlers[event] {
        go handler() // Goroutines never cleaned up
    }
}

// GOOD: Managed event handlers
type GoodEventManager struct {
    handlers map[string][]func()
    mu       sync.RWMutex
    ctx      context.Context
    cancel   context.CancelFunc
}

func NewGoodEventManager() *GoodEventManager {
    ctx, cancel := context.WithCancel(context.Background())
    return &GoodEventManager{
        handlers: make(map[string][]func()),
        ctx:      ctx,
        cancel:   cancel,
    }
}

func (em *GoodEventManager) AddHandler(event string, handler func()) func() {
    em.mu.Lock()
    defer em.mu.Unlock()

    em.handlers[event] = append(em.handlers[event], handler)

    return func() { // Return removal function
        em.removeHandler(event, handler)
    }
}

func (em *GoodEventManager) removeHandler(event string, handler func()) {
    em.mu.Lock()
    defer em.mu.Unlock()

    handlers := em.handlers[event]
    for i, h := range handlers {
        // Remove handler (simplified)
        if &h == &handler {
            em.handlers[event] = append(handlers[:i], handlers[i+1:]...)
            break
        }
    }
}

func (em *GoodEventManager) Cleanup() {
    em.cancel()
    em.mu.Lock()
    defer em.mu.Unlock()

    for event := range em.handlers {
        delete(em.handlers, event)
    }
}
```

### C#/.NET Example

```csharp
// BAD: Event handlers that accumulate
using System;
using System.Windows.Forms;

public class BadEventManager
{
    private Button button;

    public void AttachHandlers()
    {
        for (int i = 0; i < 1000; i++)
        {
            button.Click += (sender, e) => Console.WriteLine($"Click {i}");
            // Handlers accumulate, never removed
        }
    }
}

// GOOD: Proper event handler management
public class GoodEventManager : IDisposable
{
    private Button button;
    private readonly List<EventHandler> handlers = new List<EventHandler>();

    public void AttachHandler(EventHandler handler)
    {
        button.Click += handler;
        handlers.Add(handler);
    }

    public void RemoveHandler(EventHandler handler)
    {
        button.Click -= handler;
        handlers.Remove(handler);
    }

    public void Dispose()
    {
        foreach (var handler in handlers)
        {
            button.Click -= handler;
        }
        handlers.Clear();
        button?.Dispose();
    }
}
```

### React Components

```javascript
// BAD: Component with listener leaks
class BadComponent extends React.Component {
    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('click', this.handleDocumentClick);

        // WebSocket listeners
        this.socket = new WebSocket('ws://localhost:8080');
        this.socket.addEventListener('message', this.handleMessage);
    }

    handleResize = () => {
        this.setState({ width: window.innerWidth });
    }

    handleDocumentClick = (event) => {
        // Handle click
    }

    handleMessage = (event) => {
        // Handle WebSocket message
    }

    render() {
        return <div>Component</div>;
    }

    // Missing componentWillUnmount - listeners never removed!
}

// GOOD: Proper cleanup
class GoodComponent extends React.Component {
    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('click', this.handleDocumentClick);

        this.socket = new WebSocket('ws://localhost:8080');
        this.socket.addEventListener('message', this.handleMessage);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('click', this.handleDocumentClick);

        if (this.socket) {
            this.socket.removeEventListener('message', this.handleMessage);
            this.socket.close();
        }
    }

    handleResize = () => {
        this.setState({ width: window.innerWidth });
    }

    handleDocumentClick = (event) => {
        // Handle click
    }

    handleMessage = (event) => {
        // Handle WebSocket message
    }

    render() {
        return <div>Component</div>;
    }
}
```

### Vue.js Components

```javascript
// BAD: Vue component without cleanup
export default {
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
        this.$bus.$on('custom-event', this.handleCustomEvent);

        this.observer = new MutationObserver(this.handleMutation);
        this.observer.observe(document.body, { childList: true });
    },

    methods: {
        handleScroll() {
            // Handle scroll
        },

        handleCustomEvent(data) {
            // Handle custom event
        },

        handleMutation(mutations) {
            // Handle DOM mutations
        }
    }

    // Missing beforeDestroy/beforeUnmount
};

// GOOD: Proper cleanup
export default {
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
        this.$bus.$on('custom-event', this.handleCustomEvent);

        this.observer = new MutationObserver(this.handleMutation);
        this.observer.observe(document.body, { childList: true });
    },

    beforeDestroy() { // Vue 2
    // beforeUnmount() { // Vue 3
        window.removeEventListener('scroll', this.handleScroll);
        this.$bus.$off('custom-event', this.handleCustomEvent);

        if (this.observer) {
            this.observer.disconnect();
        }
    },

    methods: {
        handleScroll() {
            // Handle scroll
        },

        handleCustomEvent(data) {
            // Handle custom event
        },

        handleMutation(mutations) {
            // Handle DOM mutations
        }
    }
};
```

### Angular Components

```typescript
// BAD: Angular component without cleanup
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-bad-component',
    template: '<div>Component</div>'
})
export class BadComponent implements OnInit {
    private eventHandler = (event: Event) => {
        // Handle event
    };

    ngOnInit() {
        window.addEventListener('resize', this.eventHandler);
        document.addEventListener('click', this.eventHandler);

        // RxJS subscription without unsubscribe
        this.dataService.getData().subscribe(data => {
            this.processData(data);
        });
    }

    private processData(data: any) {
        // Process data
    }

    // Missing ngOnDestroy
}

// GOOD: Proper cleanup with OnDestroy
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-good-component',
    template: '<div>Component</div>'
})
export class GoodComponent implements OnInit, OnDestroy {
    private subscription = new Subscription();

    private eventHandler = (event: Event) => {
        // Handle event
    };

    ngOnInit() {
        window.addEventListener('resize', this.eventHandler);
        document.addEventListener('click', this.eventHandler);

        // Managed subscription
        const dataSubscription = this.dataService.getData().subscribe(data => {
            this.processData(data);
        });

        this.subscription.add(dataSubscription);
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.eventHandler);
        document.removeEventListener('click', this.eventHandler);
        this.subscription.unsubscribe();
    }

    private processData(data: any) {
        // Process data
    }
}
```

### Java Swing

```java
// BAD: Swing component without cleanup
public class BadPanel extends JPanel {
    private Timer timer;
    private MouseListener mouseListener;

    public BadPanel() {
        mouseListener = new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                handleClick(e);
            }
        };

        addMouseListener(mouseListener);

        timer = new Timer(1000, e -> updateDisplay());
        timer.start();

        // Add window listener
        SwingUtilities.getWindowAncestor(this).addWindowListener(
            new WindowAdapter() {
                @Override
                public void windowClosing(WindowEvent e) {
                    // Some cleanup, but not complete
                }
            }
        );
    }

    private void handleClick(MouseEvent e) {
        // Handle click
    }

    private void updateDisplay() {
        // Update display
    }

    // Missing cleanup method
}

// GOOD: Proper cleanup
public class GoodPanel extends JPanel {
    private Timer timer;
    private MouseListener mouseListener;
    private WindowListener windowListener;

    public GoodPanel() {
        setupListeners();
        setupTimer();
    }

    private void setupListeners() {
        mouseListener = new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                handleClick(e);
            }
        };

        addMouseListener(mouseListener);

        windowListener = new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                cleanup();
            }
        };

        SwingUtilities.getWindowAncestor(this).addWindowListener(windowListener);
    }

    private void setupTimer() {
        timer = new Timer(1000, e -> updateDisplay());
        timer.start();
    }

    public void cleanup() {
        if (timer != null) {
            timer.stop();
            timer = null;
        }

        if (mouseListener != null) {
            removeMouseListener(mouseListener);
            mouseListener = null;
        }

        if (windowListener != null) {
            Window window = SwingUtilities.getWindowAncestor(this);
            if (window != null) {
                window.removeWindowListener(windowListener);
            }
            windowListener = null;
        }
    }
}
```

## Impact of Event Listener Memory Leaks

Event listener memory leaks are particularly dangerous because:

- **DOM Element Retention**: Event listeners prevent DOM elements from being garbage collected
- **Circular References**: Listeners often create circular references between objects and DOM elements
- **Memory Accumulation**: Each unremoved listener accumulates in memory over component lifecycle
- **Performance Degradation**: Excessive event listeners slow down DOM operations and event dispatching
- **Browser Crashes**: Large numbers of unremoved listeners can cause browser tab crashes

## Common Event Listener Leak Patterns

### 1. Anonymous Function Listeners

```javascript
// BAD: Can't remove anonymous listeners
function attachAnonymousListeners() {
    const button = document.getElementById('myButton');

    button.addEventListener('click', function() {
        // Anonymous function - no way to remove
        console.log('Button clicked');
    });

    button.addEventListener('mouseover', () => {
        // Arrow function - also can't be removed
        button.style.color = 'red';
    });
}

// GOOD: Named functions for removal
class ButtonManager {
    constructor(buttonId) {
        this.button = document.getElementById(buttonId);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.attachListeners();
    }

    attachListeners() {
        this.button.addEventListener('click', this.handleClick);
        this.button.addEventListener('mouseover', this.handleMouseOver);
    }

    removeListeners() {
        this.button.removeEventListener('click', this.handleClick);
        this.button.removeEventListener('mouseover', this.handleMouseOver);
    }

    handleClick() {
        console.log('Button clicked');
    }

    handleMouseOver() {
        this.button.style.color = 'red';
    }

    destroy() {
        this.removeListeners();
        this.button = null;
    }
}
```

### 2. Circular References

```javascript
// BAD: Circular references prevent GC
function createCircularReference() {
    const container = document.getElementById('container');
    const data = { elements: [] };

    container.children.forEach(element => {
        element.customData = data; // Element references data

        element.addEventListener('click', function() {
            // Closure captures 'data' which references element
            data.elements.push(element);
        });
    });
}

// GOOD: Break circular references
function createNonCircularReference() {
    const container = document.getElementById('container');
    const elementData = new WeakMap(); // Use WeakMap

    container.children.forEach(element => {
        const data = { count: 0 };
        elementData.set(element, data);

        function handleClick() {
            const elementSpecificData = elementData.get(element);
            elementSpecificData.count++;
        }

        element.addEventListener('click', handleClick);
        element._clickHandler = handleClick; // Store for removal
    });
}

function cleanupNonCircularReference() {
    const container = document.getElementById('container');

    container.children.forEach(element => {
        if (element._clickHandler) {
            element.removeEventListener('click', element._clickHandler);
            delete element._clickHandler;
        }
    });
}
```

### 3. Global Event Accumulation

```javascript
// BAD: Global listeners accumulate
class BadWidgetManager {
    createWidget(config) {
        const widget = document.createElement('div');

        // Global listeners that accumulate
        window.addEventListener('resize', () => {
            this.resizeWidget(widget);
        });

        document.addEventListener('click', (event) => {
            if (!widget.contains(event.target)) {
                this.hideWidget(widget);
            }
        });

        return widget;
    }

    resizeWidget(widget) {
        // Resize logic
    }

    hideWidget(widget) {
        // Hide logic
    }
}

// GOOD: Managed global listeners
class GoodWidgetManager {
    constructor() {
        this.widgets = new Map();
        this.globalHandlers = {
            resize: this.handleGlobalResize.bind(this),
            click: this.handleGlobalClick.bind(this)
        };
        this.setupGlobalListeners();
    }

    setupGlobalListeners() {
        window.addEventListener('resize', this.globalHandlers.resize);
        document.addEventListener('click', this.globalHandlers.click);
    }

    createWidget(config) {
        const widget = document.createElement('div');
        this.widgets.set(widget, config);
        return widget;
    }

    destroyWidget(widget) {
        this.widgets.delete(widget);
        widget.remove();
    }

    handleGlobalResize() {
        for (const [widget, config] of this.widgets) {
            this.resizeWidget(widget, config);
        }
    }

    handleGlobalClick(event) {
        for (const [widget] of this.widgets) {
            if (!widget.contains(event.target)) {
                this.hideWidget(widget);
            }
        }
    }

    cleanup() {
        window.removeEventListener('resize', this.globalHandlers.resize);
        document.removeEventListener('click', this.globalHandlers.click);
        this.widgets.clear();
    }
}
```

## Detection Methods

### 1. Event Listener Counting

```javascript
// Override addEventListener to track listeners
const eventListenerTracker = {
    listeners: new Map(),
    originalAddEventListener: EventTarget.prototype.addEventListener,
    originalRemoveEventListener: EventTarget.prototype.removeEventListener,

    init() {
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // Track the listener
            if (!eventListenerTracker.listeners.has(this)) {
                eventListenerTracker.listeners.set(this, new Map());
            }

            const elementListeners = eventListenerTracker.listeners.get(this);
            if (!elementListeners.has(type)) {
                elementListeners.set(type, new Set());
            }

            elementListeners.get(type).add(listener);

            return eventListenerTracker.originalAddEventListener.call(this, type, listener, options);
        };

        EventTarget.prototype.removeEventListener = function(type, listener, options) {
            // Track removal
            const elementListeners = eventListenerTracker.listeners.get(this);
            if (elementListeners && elementListeners.has(type)) {
                elementListeners.get(type).delete(listener);
            }

            return eventListenerTracker.originalRemoveEventListener.call(this, type, listener, options);
        };
    },

    getStats() {
        let totalListeners = 0;
        const stats = [];

        for (const [element, listeners] of this.listeners) {
            for (const [type, listenerSet] of listeners) {
                const count = listenerSet.size;
                totalListeners += count;

                if (count > 0) {
                    stats.push({
                        element: element.tagName || element.constructor.name,
                        type,
                        count
                    });
                }
            }
        }

        return { totalListeners, details: stats };
    }
};

// Usage
eventListenerTracker.init();

// Later, check for listener leaks
console.table(eventListenerTracker.getStats().details);
```

### 2. Memory Usage Monitoring

```javascript
class EventListenerMemoryMonitor {
    constructor() {
        this.baselineMemory = this.getMemoryUsage();
        this.listenerCount = 0;
        this.samples = [];
    }

    getMemoryUsage() {
        if (typeof process !== 'undefined') {
            return process.memoryUsage().heapUsed;
        } else if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }

    trackListener(element, type, listener) {
        this.listenerCount++;

        const sample = {
            timestamp: Date.now(),
            listenerCount: this.listenerCount,
            memoryUsage: this.getMemoryUsage(),
            memoryDelta: this.getMemoryUsage() - this.baselineMemory
        };

        this.samples.push(sample);

        // Keep only last 100 samples
        if (this.samples.length > 100) {
            this.samples.shift();
        }

        return listener;
    }

    getReport() {
        const latestSample = this.samples[this.samples.length - 1];
        const memoryPerListener = latestSample ?
            latestSample.memoryDelta / this.listenerCount : 0;

        return {
            totalListeners: this.listenerCount,
            memoryDelta: latestSample ? latestSample.memoryDelta : 0,
            memoryPerListener: Math.round(memoryPerListener),
            trend: this.calculateTrend()
        };
    }

    calculateTrend() {
        if (this.samples.length < 10) return 'insufficient_data';

        const recent = this.samples.slice(-10);
        const memoryTrend = recent[recent.length - 1].memoryDelta - recent[0].memoryDelta;

        return memoryTrend > 1024 * 1024 ? 'increasing' : 'stable'; // 1MB threshold
    }
}
```

### 3. DOM Node Retention Check

```javascript
function checkDOMNodeRetention() {
    const orphanedNodes = [];
    const allElements = document.querySelectorAll('*');

    allElements.forEach(element => {
        // Check if element has event listeners but is detached
        const hasListeners = eventListenerTracker.listeners.has(element);
        const isInDOM = document.contains(element);

        if (hasListeners && !isInDOM) {
            const listeners = eventListenerTracker.listeners.get(element);
            let totalListeners = 0;

            for (const [type, listenerSet] of listeners) {
                totalListeners += listenerSet.size;
            }

            orphanedNodes.push({
                element: element.tagName,
                id: element.id,
                className: element.className,
                listenerCount: totalListeners
            });
        }
    });

    return orphanedNodes;
}

// Usage
setInterval(() => {
    const orphaned = checkDOMNodeRetention();
    if (orphaned.length > 0) {
        console.warn('Orphaned nodes with listeners:', orphaned);
    }
}, 30000); // Check every 30 seconds
```

## Prevention Strategies

### 1. Automatic Cleanup with AbortController

```javascript
// Modern approach using AbortController
class AutoCleanupComponent {
    constructor() {
        this.abortController = new AbortController();
        this.signal = this.abortController.signal;
        this.setupListeners();
    }

    setupListeners() {
        // All listeners use the same signal
        window.addEventListener('resize', this.handleResize, {
            signal: this.signal
        });

        document.addEventListener('click', this.handleClick, {
            signal: this.signal
        });

        // Works with fetch too
        fetch('/api/data', { signal: this.signal })
            .then(response => response.json())
            .then(data => this.handleData(data));
    }

    handleResize = () => {
        // Handle resize
    }

    handleClick = (event) => {
        // Handle click
    }

    handleData(data) {
        // Handle data
    }

    destroy() {
        // Single call removes all listeners
        this.abortController.abort();
    }
}
```

### 2. Event Delegation

```javascript
// Use event delegation to minimize listeners
class DelegatedEventManager {
    constructor(container) {
        this.container = container;
        this.setupDelegation();
    }

    setupDelegation() {
        // Single listener handles all button clicks
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('mouseover', this.handleMouseOver.bind(this));
    }

    handleClick(event) {
        if (event.target.matches('.clickable-button')) {
            this.handleButtonClick(event.target);
        } else if (event.target.matches('.toggle-switch')) {
            this.handleToggle(event.target);
        }
    }

    handleMouseOver(event) {
        if (event.target.matches('.hoverable')) {
            this.handleHover(event.target);
        }
    }

    handleButtonClick(button) {
        // Handle button click
    }

    handleToggle(toggle) {
        // Handle toggle
    }

    handleHover(element) {
        // Handle hover
    }

    destroy() {
        // Only need to remove container listeners
        this.container.removeEventListener('click', this.handleClick);
        this.container.removeEventListener('mouseover', this.handleMouseOver);
    }
}
```

### 3. Listener Registry Pattern

```javascript
class ListenerRegistry {
    constructor() {
        this.listeners = new Map();
    }

    add(element, type, handler, options = {}) {
        const key = this.getKey(element, type, handler);

        if (this.listeners.has(key)) {
            console.warn('Duplicate listener registration:', key);
            return;
        }

        element.addEventListener(type, handler, options);
        this.listeners.set(key, { element, type, handler, options });

        return () => this.remove(element, type, handler);
    }

    remove(element, type, handler) {
        const key = this.getKey(element, type, handler);
        const listener = this.listeners.get(key);

        if (listener) {
            element.removeEventListener(type, handler);
            this.listeners.delete(key);
            return true;
        }

        return false;
    }

    removeAll() {
        for (const [key, { element, type, handler }] of this.listeners) {
            element.removeEventListener(type, handler);
        }
        this.listeners.clear();
    }

    getKey(element, type, handler) {
        return `${element.id || 'anonymous'}_${type}_${handler.name || 'anonymous'}`;
    }

    getStats() {
        const stats = new Map();

        for (const [key, { element, type }] of this.listeners) {
            const elementKey = element.tagName || element.constructor.name;

            if (!stats.has(elementKey)) {
                stats.set(elementKey, new Map());
            }

            const elementStats = stats.get(elementKey);
            elementStats.set(type, (elementStats.get(type) || 0) + 1);
        }

        return stats;
    }
}

// Usage
const registry = new ListenerRegistry();

const removeHandler = registry.add(button, 'click', handleClick);

// Later
removeHandler(); // or registry.removeAll();
```

## Testing Event Listener Leaks

### Manual Testing

Use our demo API to simulate event listener leaks:

```bash
# Start event listener leak
curl -X POST http://localhost:3000/memory-leak/event-listener/start

# Check status
curl http://localhost:3000/memory-leak/event-listener/status

# Stop leak
curl -X POST http://localhost:3000/memory-leak/event-listener/stop
```

### Automated Testing

```javascript
describe('Event Listener Leak Tests', () => {
    let registry;

    beforeEach(() => {
        registry = new ListenerRegistry();
    });

    afterEach(() => {
        registry.removeAll();
    });

    test('should remove all listeners on cleanup', () => {
        const button = document.createElement('button');
        const handler = jest.fn();

        registry.add(button, 'click', handler);

        // Trigger event
        button.click();
        expect(handler).toHaveBeenCalledTimes(1);

        // Remove listeners
        registry.removeAll();

        // Should not trigger after removal
        button.click();
        expect(handler).toHaveBeenCalledTimes(1);
    });

    test('should prevent duplicate listeners', () => {
        const button = document.createElement('button');
        const handler = jest.fn();

        registry.add(button, 'click', handler);
        registry.add(button, 'click', handler); // Duplicate

        button.click();
        expect(handler).toHaveBeenCalledTimes(1); // Should only be called once
    });

    test('should track listener statistics', () => {
        const button1 = document.createElement('button');
        const button2 = document.createElement('button');

        registry.add(button1, 'click', () => {});
        registry.add(button1, 'mouseover', () => {});
        registry.add(button2, 'click', () => {});

        const stats = registry.getStats();
        expect(stats.get('BUTTON').get('click')).toBe(2);
        expect(stats.get('BUTTON').get('mouseover')).toBe(1);
    });
});
```

## Performance Optimization

```javascript
class OptimizedEventManager {
    constructor() {
        this.throttledHandlers = new Map();
        this.debouncedHandlers = new Map();
    }

    // Throttle high-frequency events
    addThrottled(element, type, handler, delay = 100) {
        const key = `${element.id}_${type}`;

        if (this.throttledHandlers.has(key)) {
            this.removeThrottled(element, type);
        }

        let lastCall = 0;
        const throttledHandler = (event) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                handler(event);
            }
        };

        element.addEventListener(type, throttledHandler);
        this.throttledHandlers.set(key, { element, type, handler: throttledHandler });

        return () => this.removeThrottled(element, type);
    }

    removeThrottled(element, type) {
        const key = `${element.id}_${type}`;
        const entry = this.throttledHandlers.get(key);

        if (entry) {
            element.removeEventListener(type, entry.handler);
            this.throttledHandlers.delete(key);
        }
    }

    // Debounce events that should only fire after inactivity
    addDebounced(element, type, handler, delay = 300) {
        const key = `${element.id}_${type}`;

        if (this.debouncedHandlers.has(key)) {
            this.removeDebounced(element, type);
        }

        let timeoutId;
        const debouncedHandler = (event) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => handler(event), delay);
        };

        element.addEventListener(type, debouncedHandler);
        this.debouncedHandlers.set(key, { element, type, handler: debouncedHandler });

        return () => this.removeDebounced(element, type);
    }

    removeDebounced(element, type) {
        const key = `${element.id}_${type}`;
        const entry = this.debouncedHandlers.get(key);

        if (entry) {
            element.removeEventListener(type, entry.handler);
            this.debouncedHandlers.delete(key);
        }
    }

    cleanup() {
        // Remove all throttled handlers
        for (const [key, { element, type, handler }] of this.throttledHandlers) {
            element.removeEventListener(type, handler);
        }
        this.throttledHandlers.clear();

        // Remove all debounced handlers
        for (const [key, { element, type, handler }] of this.debouncedHandlers) {
            element.removeEventListener(type, handler);
        }
        this.debouncedHandlers.clear();
    }
}
```

## Best Practices

### 1. Use Modern Event Management

```javascript
// Use AbortController for automatic cleanup
class ModernComponent {
    constructor() {
        this.controller = new AbortController();
        this.setupEvents();
    }

    setupEvents() {
        const options = { signal: this.controller.signal };

        window.addEventListener('resize', this.handleResize, options);
        document.addEventListener('click', this.handleClick, options);

        // Even works with custom events
        this.eventTarget = new EventTarget();
        this.eventTarget.addEventListener('custom', this.handleCustom, options);
    }

    destroy() {
        this.controller.abort(); // Removes all listeners automatically
    }
}
```

### 2. Implement Component Lifecycle Hooks

```javascript
class ComponentBase {
    constructor() {
        this.listeners = [];
        this.mounted = false;
    }

    addEventListener(element, type, handler, options) {
        if (!this.mounted) {
            console.warn('Adding listener to unmounted component');
            return;
        }

        element.addEventListener(type, handler, options);
        this.listeners.push({ element, type, handler });
    }

    mount() {
        this.mounted = true;
        this.onMount();
    }

    unmount() {
        this.mounted = false;
        this.removeAllListeners();
        this.onUnmount();
    }

    removeAllListeners() {
        this.listeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.listeners = [];
    }

    onMount() {
        // Override in subclasses
    }

    onUnmount() {
        // Override in subclasses
    }
}
```

### 3. Monitor and Alert

```javascript
class EventListenerMonitor {
    constructor(thresholds = { total: 1000, perElement: 50 }) {
        this.thresholds = thresholds;
        this.startMonitoring();
    }

    startMonitoring() {
        setInterval(() => {
            this.checkThresholds();
        }, 30000); // Check every 30 seconds
    }

    checkThresholds() {
        const stats = eventListenerTracker.getStats();

        if (stats.totalListeners > this.thresholds.total) {
            console.warn(`High listener count: ${stats.totalListeners}`);
            this.reportTopOffenders(stats.details);
        }

        const highElementCounts = stats.details.filter(
            stat => stat.count > this.thresholds.perElement
        );

        if (highElementCounts.length > 0) {
            console.warn('Elements with high listener counts:', highElementCounts);
        }
    }

    reportTopOffenders(details) {
        const sorted = details
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        console.table(sorted);
    }
}
```

## Related Topics

- [Global Variable Memory Leaks](./global-variables.md)
- [Closure Memory Leaks](./closures.md)
- [Timer Memory Leaks](./timers.md)
- [Cache Memory Leaks](./caching.md)

## Demo

Try the interactive event listener leak demo in our [NestJS Demo](../demos/nestjs.md) to see these concepts in action.
