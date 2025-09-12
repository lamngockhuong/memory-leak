# Rò Rỉ Bộ Nhớ Event Listener

Rò rỉ bộ nhớ event listener là một trong những nguyên nhân phổ biến nhất gây rò rỉ bộ nhớ trong các ứng dụng web và framework GUI. Chúng xảy ra khi các event listener được gắn vào nhưng không bao giờ được loại bỏ đúng cách, khiến các phần tử DOM, component, hoặc đối tượng vẫn tồn tại trong bộ nhớ vô thời hạn.

## Rò Rỉ Bộ Nhớ Event Listener Là Gì?

Rò rỉ bộ nhớ event listener xảy ra khi:

1. **Event listener không được loại bỏ** khi component bị hủy
2. **Anonymous function** được sử dụng làm event handler (không thể loại bỏ)
3. **Tham chiếu vòng** tồn tại giữa các phần tử DOM và handler
4. **Mối quan hệ cha-con** ngăn cản việc thu gom rác
5. **Global event listener** tích lũy theo thời gian

## Cách Rò Rỉ Bộ Nhớ Event Listener Xảy Ra

### Ví Dụ JavaScript/Node.js

```javascript
// TỆ: Anonymous listener không thể loại bỏ
function attachBadListeners() {
    const elements = document.querySelectorAll('.item');

    elements.forEach(element => {
        element.addEventListener('click', function(event) {
            console.log('Clicked:', event.target.id);
        });
    });
}

// TỆ: EventEmitter listener tích lũy
const EventEmitter = require('events');

class BadDataProcessor extends EventEmitter {
    addDataHandler() {
        this.on('data', (item) => {
            this.data.push(item); // Tích lũy listener
        });
    }
}

// TỐT: Named function có thể loại bỏ
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

### Ví Dụ Python

```python
# TỆ: Event listener tích lũy
import tkinter as tk
from threading import Event

class BadEventHandler:
    def __init__(self):
        self.root = tk.Tk()
        self.listeners = []

    def add_listener(self, event_type, callback):
        # Tích lũy listener mà không dọn dẹp
        self.root.bind(event_type, callback)
        self.listeners.append((event_type, callback))

    def handle_click(self, event):
        print(f"Clicked: {event.x}, {event.y}")

# TỐT: Quản lý listener đúng cách
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

### Ví Dụ Java

```java
// TỆ: Swing listener mà không dọn dẹp
import javax.swing.*;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;

public class BadEventManager {
    private JButton button;
    private List<ActionListener> listeners = new ArrayList<>();

    public void addListener(ActionListener listener) {
        button.addActionListener(listener); // Không bao giờ được loại bỏ
        listeners.add(listener);
    }

    public void processEvents() {
        for (int i = 0; i < 1000; i++) {
            addListener(e -> System.out.println("Event " + i));
        }
    }
}

// TỐT: Dọn dẹp listener đúng cách
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

### Ví Dụ Go

```go
// TỆ: Event handler tích lũy
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
    // Handler không bao giờ được loại bỏ
}

func (em *BadEventManager) EmitEvent(event string) {
    em.mu.RLock()
    defer em.mu.RUnlock()
    for _, handler := range em.handlers[event] {
        go handler() // Goroutine không bao giờ được dọn dẹp
    }
}

// TỐT: Event handler được quản lý
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

    return func() { // Trả về function loại bỏ
        em.removeHandler(event, handler)
    }
}

func (em *GoodEventManager) removeHandler(event string, handler func()) {
    em.mu.Lock()
    defer em.mu.Unlock()

    handlers := em.handlers[event]
    for i, h := range handlers {
        // Loại bỏ handler (đơn giản hóa)
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

### Ví Dụ C#/.NET

```csharp
// TỆ: Event handler tích lũy
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
            // Handler tích lũy, không bao giờ được loại bỏ
        }
    }
}

// TỐT: Quản lý event handler đúng cách
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

## Tác Động Của Rò Rỉ Bộ Nhớ Event Listener

Rò rỉ bộ nhớ event listener đặc biệt nguy hiểm vì:

- **Giữ Phần Tử DOM**: Event listener ngăn các phần tử DOM được thu gom rác
- **Tham Chiếu Vòng**: Listener thường tạo tham chiếu vòng giữa đối tượng và phần tử DOM
- **Tích Lũy Bộ Nhớ**: Mỗi listener không được loại bỏ tích lũy trong bộ nhớ qua vòng đời component
- **Suy Giảm Hiệu Suất**: Quá nhiều event listener làm chậm các thao tác DOM và dispatch event
- **Crash Trình Duyệt**: Số lượng lớn listener không được loại bỏ có thể gây crash browser tab

## Các Mẫu Rò Rỉ Event Listener Phổ Biến

### 1. Anonymous Function Listeners

```javascript
// TỆ: Không thể loại bỏ anonymous listener
function attachAnonymousListeners() {
    const button = document.getElementById('myButton');

    button.addEventListener('click', function() {
        // Anonymous function - không có cách nào loại bỏ
        console.log('Button clicked');
    });

    button.addEventListener('mouseover', () => {
        // Arrow function - cũng không thể loại bỏ
        button.style.color = 'red';
    });
}

// TỐT: Named function để loại bỏ
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

### 2. Tham Chiếu Vòng

```javascript
// TỆ: Tham chiếu vòng ngăn GC
function createCircularReference() {
    const container = document.getElementById('container');
    const data = { elements: [] };

    container.children.forEach(element => {
        element.customData = data; // Element tham chiếu data

        element.addEventListener('click', function() {
            // Closure nắm bắt 'data' cái mà tham chiếu element
            data.elements.push(element);
        });
    });
}

// TỐT: Phá vỡ tham chiếu vòng
function createNonCircularReference() {
    const container = document.getElementById('container');
    const elementData = new WeakMap(); // Sử dụng WeakMap

    container.children.forEach(element => {
        const data = { count: 0 };
        elementData.set(element, data);

        function handleClick() {
            const elementSpecificData = elementData.get(element);
            elementSpecificData.count++;
        }

        element.addEventListener('click', handleClick);
        element._clickHandler = handleClick; // Lưu trữ để loại bỏ
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

### 3. Tích Lũy Global Event

```javascript
// TỆ: Global listener tích lũy
class BadWidgetManager {
    createWidget(config) {
        const widget = document.createElement('div');

        // Global listener tích lũy
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
        // Logic resize
    }

    hideWidget(widget) {
        // Logic hide
    }
}

// TỐT: Global listener được quản lý
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

## Phương Pháp Phát Hiện

### 1. Đếm Event Listener

```javascript
// Override addEventListener để theo dõi listener
const eventListenerTracker = {
    listeners: new Map(),
    originalAddEventListener: EventTarget.prototype.addEventListener,
    originalRemoveEventListener: EventTarget.prototype.removeEventListener,

    init() {
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // Theo dõi listener
            const key = `${this.constructor.name}_${type}`;
            if (!eventListenerTracker.listeners.has(key)) {
                eventListenerTracker.listeners.set(key, 0);
            }
            eventListenerTracker.listeners.set(key, eventListenerTracker.listeners.get(key) + 1);

            return eventListenerTracker.originalAddEventListener.call(this, type, listener, options);
        };

        EventTarget.prototype.removeEventListener = function(type, listener, options) {
            const key = `${this.constructor.name}_${type}`;
            if (eventListenerTracker.listeners.has(key)) {
                eventListenerTracker.listeners.set(key, eventListenerTracker.listeners.get(key) - 1);
            }

            return eventListenerTracker.originalRemoveEventListener.call(this, type, listener, options);
        };
    },

    getStats() {
        let totalListeners = 0;
        const details = [];

        for (const [key, count] of this.listeners) {
            totalListeners += count;
            details.push({ elementType: key, count });
        }

        return { totalListeners, details };
    }
};

// Sử dụng
eventListenerTracker.init();

// Sau này, kiểm tra rò rỉ listener
console.table(eventListenerTracker.getStats().details);
```

### 2. Giám Sát Sử Dụng Bộ Nhớ

```javascript
class EventListenerMemoryMonitor {
    constructor() {
        this.baselineMemory = this.getMemoryUsage();
        this.samples = [];
        this.listenerCount = 0;
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
        const currentMemory = this.getMemoryUsage();
        this.samples.push({
            timestamp: Date.now(),
            memory: currentMemory,
            listenerCount: this.listenerCount
        });

        return listener;
    }

    getReport() {
        const currentMemory = this.getMemoryUsage();
        const memoryIncrease = currentMemory - this.baselineMemory;
        const latestSample = this.samples[this.samples.length - 1];

        return {
            baselineMemory: this.baselineMemory,
            currentMemory,
            memoryIncrease,
            listenerCount: this.listenerCount,
            trend: this.calculateTrend(),
            samplesCount: this.samples.length
        };
    }

    calculateTrend() {
        if (this.samples.length < 10) return 'insufficient_data';

        const recent = this.samples.slice(-10);
        const memoryTrend = recent[recent.length - 1].memory - recent[0].memory;

        return memoryTrend > 1024 * 1024 ? 'increasing' : 'stable'; // Ngưỡng 1MB
    }
}
```

### 3. Kiểm Tra Giữ DOM Node

```javascript
function checkDOMNodeRetention() {
    const orphanedNodes = [];
    const allElements = document.querySelectorAll('*');

    allElements.forEach(element => {
        // Kiểm tra nếu element có event listener nhưng bị tách rời
        if (element._handlers && !document.contains(element)) {
            orphanedNodes.push({
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                handlerCount: Object.keys(element._handlers).length
            });
        }
    });

    return orphanedNodes;
}

// Sử dụng
setInterval(() => {
    const orphaned = checkDOMNodeRetention();
    if (orphaned.length > 0) {
        console.warn('Node bị tách rời với listener:', orphaned);
    }
}, 30000); // Kiểm tra mỗi 30 giây
```

## Chiến Lược Phòng Ngừa

### 1. Dọn Dẹp Tự Động với AbortController

```javascript
// Cách tiếp cận hiện đại sử dụng AbortController
class AutoCleanupComponent {
    constructor() {
        this.abortController = new AbortController();
        this.setupListeners();
    }

    setupListeners() {
        const options = { signal: this.abortController.signal };

        // Tất cả listener sử dụng cùng signal
        window.addEventListener('resize', this.handleResize, options);
        document.addEventListener('click', this.handleClick, options);

        // Fetch cũng có thể sử dụng signal
        fetch('/api/data', options)
            .then(response => response.json())
            .then(data => this.handleData(data));
    }

    handleResize = () => {
        // Xử lý resize
    }

    handleClick = (event) => {
        // Xử lý click
    }

    handleData(data) {
        // Xử lý data
    }

    destroy() {
        // Lệnh gọi duy nhất loại bỏ tất cả listener
        this.abortController.abort();
    }
}
```

### 2. Event Delegation

```javascript
// Sử dụng event delegation để giảm thiểu listener
class DelegatedEventManager {
    constructor(container) {
        this.container = container;
        this.setupDelegation();
    }

    setupDelegation() {
        // Listener duy nhất xử lý tất cả button click
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
        // Xử lý button click
    }

    handleToggle(toggle) {
        // Xử lý toggle
    }

    handleHover(element) {
        // Xử lý hover
    }

    destroy() {
        // Chỉ cần loại bỏ container listener
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

        element.addEventListener(type, handler, options);
        this.listeners.set(key, { element, type, handler });

        return () => this.remove(element, type, handler);
    }

    remove(element, type, handler) {
        const key = this.getKey(element, type, handler);

        if (this.listeners.has(key)) {
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
            const elementType = element.tagName || element.constructor.name;
            if (!stats.has(elementType)) {
                stats.set(elementType, new Map());
            }

            const typeStats = stats.get(elementType);
            typeStats.set(type, (typeStats.get(type) || 0) + 1);
        }

        return stats;
    }
}

// Sử dụng
const registry = new ListenerRegistry();

const removeHandler = registry.add(button, 'click', handleClick);

// Sau này
removeHandler(); // hoặc registry.removeAll();
```

## Kiểm Thử Rò Rỉ Bộ Nhớ Event Listener

### Kiểm Thử Thủ Công

Sử dụng API demo của chúng tôi để mô phỏng rò rỉ event listener:

```bash
# Bắt đầu rò rỉ event listener
curl -X POST http://localhost:3000/memory-leak/event-listener/start

# Kiểm tra trạng thái
curl http://localhost:3000/memory-leak/event-listener/status

# Dừng rò rỉ
curl -X POST http://localhost:3000/memory-leak/event-listener/stop
```

### Kiểm Thử Tự Động

```javascript
describe('Kiểm Thử Rò Rỉ Event Listener', () => {
    let registry;

    beforeEach(() => {
        registry = new ListenerRegistry();
    });

    afterEach(() => {
        registry.removeAll();
    });

    test('nên loại bỏ tất cả listener khi dọn dẹp', () => {
        const button = document.createElement('button');
        document.body.appendChild(button);

        const handler = jest.fn();
        registry.add(button, 'click', handler);

        button.click();
        expect(handler).toHaveBeenCalledTimes(1);

        registry.removeAll();
        button.click();
        expect(handler).toHaveBeenCalledTimes(1); // Không tăng thêm

        document.body.removeChild(button);
    });

    test('nên ngăn listener trùng lặp', () => {
        const button = document.createElement('button');
        document.body.appendChild(button);

        const handler = jest.fn();
        registry.add(button, 'click', handler);
        registry.add(button, 'click', handler); // Thêm lại

        button.click();
        expect(handler).toHaveBeenCalledTimes(1); // Chỉ nên được gọi một lần

        document.body.removeChild(button);
    });

    test('nên theo dõi thống kê listener', () => {
        const button1 = document.createElement('button');
        const button2 = document.createElement('div');

        registry.add(button1, 'click', () => {});
        registry.add(button1, 'mouseover', () => {});
        registry.add(button2, 'mouseover', () => {});

        const stats = registry.getStats();
        expect(stats.get('BUTTON').get('click')).toBe(1);
        expect(stats.get('BUTTON').get('mouseover')).toBe(1);
        expect(stats.get('DIV').get('mouseover')).toBe(1);
    });
});
```

## Tối Ưu Hóa Hiệu Suất

```javascript
class OptimizedEventManager {
    constructor() {
        this.throttledHandlers = new Map();
        this.debouncedHandlers = new Map();
    }

    // Throttle event tần số cao
    addThrottled(element, type, handler, delay = 100) {
        const key = `${element.id}_${type}`;

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

    // Debounce event chỉ nên fire sau khi không hoạt động
    addDebounced(element, type, handler, delay = 300) {
        const key = `${element.id}_${type}`;

        let timeout;
        const debouncedHandler = (event) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => handler(event), delay);
        };

        element.addEventListener(type, debouncedHandler);
        this.debouncedHandlers.set(key, { element, type, handler: debouncedHandler, timeout });

        return () => this.removeDebounced(element, type);
    }

    removeDebounced(element, type) {
        const key = `${element.id}_${type}`;
        const entry = this.debouncedHandlers.get(key);

        if (entry) {
            clearTimeout(entry.timeout);
            element.removeEventListener(type, entry.handler);
            this.debouncedHandlers.delete(key);
        }
    }

    cleanup() {
        // Loại bỏ tất cả throttled handler
        for (const [key, entry] of this.throttledHandlers) {
            entry.element.removeEventListener(entry.type, entry.handler);
        }
        this.throttledHandlers.clear();

        // Loại bỏ tất cả debounced handler
        for (const [key, entry] of this.debouncedHandlers) {
            clearTimeout(entry.timeout);
            entry.element.removeEventListener(entry.type, entry.handler);
        }
        this.debouncedHandlers.clear();
    }
}
```

## Thực Hành Tốt Nhất

### 1. Sử Dụng Quản Lý Event Hiện Đại

```javascript
// Sử dụng AbortController cho dọn dẹp tự động
class ModernComponent {
    constructor() {
        this.controller = new AbortController();
        this.setupEvents();
    }

    setupEvents() {
        const options = { signal: this.controller.signal };

        window.addEventListener('resize', this.handleResize, options);
        document.addEventListener('click', this.handleClick, options);
        this.eventTarget.addEventListener('custom', this.handleCustom, options);
    }

    destroy() {
        this.controller.abort(); // Loại bỏ tất cả listener tự động
    }
}
```

### 2. Triển Khai Component Lifecycle Hook

```javascript
class ComponentBase {
    constructor() {
        this.listeners = [];
        this.mounted = false;
    }

    addEventListener(element, type, handler, options) {
        if (!this.mounted) {
            console.warn('Thêm listener vào component chưa mount');
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
        // Override trong subclass
    }

    onUnmount() {
        // Override trong subclass
    }
}
```

### 3. Giám Sát và Cảnh Báo

```javascript
class EventListenerMonitor {
    constructor(thresholds = { total: 1000, perElement: 50 }) {
        this.thresholds = thresholds;
        this.startMonitoring();
    }

    startMonitoring() {
        setInterval(() => {
            this.checkThresholds();
        }, 30000); // Kiểm tra mỗi 30 giây
    }

    checkThresholds() {
        const stats = eventListenerTracker.getStats();

        if (stats.totalListeners > this.thresholds.total) {
            console.warn(`Cảnh báo: Tổng số listener (${stats.totalListeners}) vượt quá ngưỡng (${this.thresholds.total})`);
            this.reportTopOffenders(stats.details);
        }
    }

    reportTopOffenders(details) {
        const sorted = details
            .filter(item => item.count > this.thresholds.perElement)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        if (sorted.length > 0) {
            console.warn('Top element có nhiều listener nhất:');
            console.table(sorted);
        }
    }
}
```

## Chủ Đề Liên Quan

- [Rò Rỉ Bộ Nhớ Biến Toàn Cục](./global-variables.md)
- [Rò Rỉ Bộ Nhớ Closure](./closures.md)
- [Rò Rỉ Bộ Nhớ Timer](./timers.md)
- [Rò Rỉ Bộ Nhớ Cache](./caching.md)

## Demo

Hãy thử demo tương tác về rò rỉ event listener trong [NestJS Demo](../demos/nestjs.md) để xem các khái niệm này trong thực tế.
