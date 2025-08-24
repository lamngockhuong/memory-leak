# Global Variable Memory Leak Demo

This page demonstrates a real memory leak scenario using global variables. The content below shows the actual output from running our [NestJS demo application](/demos/nestjs) with a global variable memory leak.

## What Happened

The demo application was started with the global variable leak enabled, which continuously adds large arrays to a global variable without any cleanup mechanism.

## Actual Output

When the application reached its memory limit, Node.js generated the following error:

```bash
Leaked 1MB+
Leaked 1MB+
Leaked 1MB+
Leaked 1MB+
Leaked 1MB+

<--- Last few GCs --->

[47622:0x160008000]   832989 ms: Mark-Compact (reduce) 4094.0 (4103.1) -> 4094.0 (4103.1) MB, pooled: 0 MB, 1033.92 / 0.00 ms  (+ 8.0 ms in 0 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 1070 ms) (average mu = 0.755, [47622:0x160008000]   833838 ms: Mark-Compact (reduce) 4101.6 (4110.7) -> 4101.6 (4110.7) MB, pooled: 0 MB, 845.50 / 0.00 ms  (+ 0.1 ms in 0 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 846 ms) (average mu = 0.640, cu

<--- JS stacktrace --->

FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
----- Native stack trace -----

 1: 0x1002cf484 node::OOMErrorHandler(char const*, v8::OOMDetails const&) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
 2: 0x100495a48 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, v8::OOMDetails const&) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
 3: 0x1006a39a0 v8::internal::Heap::stack() [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
 4: 0x1006a1d40 v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
 5: 0x100696328 v8::internal::HeapAllocator::AllocateRawWithLightRetrySlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
 6: 0x100696b60 v8::internal::HeapAllocator::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
 7: 0x1006674fc v8::internal::FactoryBase<v8::internal::Factory>::NewFixedArray(int, v8::internal::AllocationType) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
 8: 0x1008089f8 v8::internal::(anonymous namespace)::ElementsAccessorBase<v8::internal::(anonymous namespace)::FastHoleyObjectElementsAccessor, v8::internal::(anonymous namespace)::ElementsKindTraits<(v8::internal::ElementsKind)3>>::ConvertElementsWithCapacity(v8::internal::Handle<v8::internal::JSObject>, v8::internal::Handle<v8::internal::FixedArrayBase>, v8::internal::ElementsKind, unsigned int, unsigned int, unsigned int) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
 9: 0x100808854 v8::internal::(anonymous namespace)::ElementsAccessorBase<v8::internal::(anonymous namespace)::FastHoleyObjectElementsAccessor, v8::internal::(anonymous namespace)::ElementsKindTraits<(v8::internal::ElementsKind)3>>::GrowCapacityAndConvertImpl(v8::internal::Handle<v8::internal::JSObject>, unsigned int) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
10: 0x1008085d0 v8::internal::(anonymous namespace)::ElementsAccessorBase<v8::internal::(anonymous namespace)::FastHoleyObjectElementsAccessor, v8::internal::(anonymous namespace)::ElementsKindTraits<(v8::internal::ElementsKind)3>>::SetLengthImpl(v8::internal::Isolate*, v8::internal::Handle<v8::internal::JSArray>, unsigned int, v8::internal::Handle<v8::internal::FixedArrayBase>) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
11: 0x1007e33f8 v8::internal::ArrayConstructInitializeElements(v8::internal::Handle<v8::internal::JSArray>, v8::internal::Arguments<(v8::internal::ArgumentsType)1>*) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
12: 0x100a8792c v8::internal::Runtime_NewArray(int, unsigned long*, v8::internal::Isolate*) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
13: 0x100f55af4 Builtins_CEntry_Return1_ArgvOnStack_NoBuiltinExit [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
14: 0x106d752c8
15: 0x106d4b3a4
16: 0x106d4a590
17: 0x100ebec0c Builtins_JSEntryTrampoline [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
18: 0x100ebe8f4 Builtins_JSEntry [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
19: 0x1005fb91c v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
20: 0x1005fb278 v8::internal::Execution::Call(v8::internal::Isolate*, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Object>, int, v8::internal::Handle<v8::internal::Object>*) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
21: 0x1004abfb4 v8::Function::Call(v8::Local<v8::Context>, v8::Local<v8::Value>, int, v8::Local<v8::Value>*) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
22: 0x100261e1c node::Environment::RunTimers(uv_timer_s*) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
23: 0x100e9bc98 uv__run_timers [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
24: 0x100e9f46c uv_run [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
25: 0x1001d6508 node::SpinEventLoopInternal(node::Environment*) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
26: 0x10031845c node::NodeMainInstance::Run() [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
27: 0x10028d4cc node::Start(int, char**) [/Users/lamngockhuong/.nvm/versions/node/v22.15.0/bin/node]
28: 0x18b306b4c start [/usr/lib/dyld]
```

## Analysis

This error demonstrates several key characteristics of memory leaks:

### Memory Exhaustion
- The application consumed over **4GB of memory** before crashing
- Each "Leaked 1MB+" message represents another 1MB+ array added to the global variable

### Garbage Collection Pressure
- Notice the "Last few GCs" section showing multiple garbage collection attempts
- Mark-Compact GC runs were unable to free significant memory because the objects were still referenced

### Fatal Out of Memory
- Eventually, Node.js couldn't allocate more memory and crashed with "JavaScript heap out of memory"

## The Leaking Code

This crash was caused by the following code pattern in our demo:

```typescript
// From /nodejs/nestjs-demo/src/utils/leak-global.ts
global.leakedArray = [];

export function leakMemory(): void {
  const largeArray = new Array(1e6).fill('leak') as string[];
  (global.leakedArray as Array<string[]>).push(largeArray);
  console.log('Leaked 1MB+');
}
```

## Key Lessons

1. **Global variables can be dangerous** - They prevent garbage collection of referenced objects
2. **Memory leaks are often gradual** - The application ran for several minutes before crashing
3. **GC cannot help** when objects are still referenced
4. **Monitoring is crucial** - In production, you want to catch this before the crash

## How to Fix

See our [Global Variables Pattern](/patterns/global-variables) guide for detailed prevention strategies.

## Try It Yourself

Run the [NestJS demo](/demos/nestjs) to reproduce this behavior in a controlled environment.
