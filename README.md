# Azure function retry test
Running into this strange behaviour when testing exponentialBackoff retry strategy for a service bus triggered function app.
## Prerequisites
A service bus with default settings with a queue with Max delivery count set to 2
## Steps to reproduce
Send any message on the queue
## Expected result
The function is called a total of 2 (queue Max delivery count) x 4 (1 original attempt + maxRetryCount retries)= 8 times.
The retry attempts should happen with an exponentially increasing delay after the previous attempt, something like:
```
1.0. Original attempt
1.1. Retry 1: 3 seconds after original attempt
1.2. Retry 2: 6 seconds after 1.1
1.3. Retry 3: 9 seconds after 1.2
2.0 Second attempt of dequeuing: immediately after 1.3
2.1. Retry 1: 3 seconds after 2.0
2.2. Retry 2: 6 seconds after 2.1
2.3. Retry 3: 9 seconds after 2.2
```
## Actual result
The retry attempts are not happening with an exponentially increasing delay after the previous attempt:
```
1.0. Original attempt
1.1. Retry 1: 3 seconds after original attempt
1.2. Retry 2: 6 seconds after 1.1
1.3. Retry 3: immediately after 1.2 (!)
2.0 Second attempt of dequeuing: immediately after 1.3
2.1. Retry 1: 3 seconds after 2.0
2.2. Retry 2: 6 seconds after 2.1
2.3. Retry 3: immediately after 2.2 (!)
```
## Example output
```
[2021-04-30T08:26:06.382Z] Executing 'Functions.ServiceBusQueueTrigger1' (Reason='New ServiceBus message detected on 'retry-test'.', Id=c86b533e-2f89-4bec-9241-835f207c8674)
[2021-04-30T08:26:06.384Z] Trigger Details: MessageId: 2dfc99404faa430ba00c0ec128fe7433, DeliveryCount: 1, EnqueuedTime: 30/04/2021 08:26:06, LockedUntil: 30/04/2021 08:26:36, SessionId: (null)
[2021-04-30T08:26:06.557Z] Executed 'Functions.ServiceBusQueueTrigger1' (Failed, Id=c86b533e-2f89-4bec-9241-835f207c8674, Duration=210ms)
[2021-04-30T08:26:06.557Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:06.557Z] Exception: Error: Pretend something went wrong and throw an error
...
[2021-04-30T08:26:09.582Z] Executing 'Functions.ServiceBusQueueTrigger1' (Reason='New ServiceBus message detected on 'retry-test'.', Id=ef3c3526-f309-4449-a38c-49c308e7ad6a)
[2021-04-30T08:26:09.582Z] Trigger Details: MessageId: 2dfc99404faa430ba00c0ec128fe7433, DeliveryCount: 1, EnqueuedTime: 30/04/2021 08:26:06, LockedUntil: 30/04/2021 08:26:36, SessionId: (null)
[2021-04-30T08:26:09.591Z] Executed 'Functions.ServiceBusQueueTrigger1' (Failed, Id=ef3c3526-f309-4449-a38c-49c308e7ad6a, Duration=8ms)
[2021-04-30T08:26:09.591Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:09.591Z] Exception: Error: Pretend something went wrong and throw an error
...
[2021-04-30T08:26:15.437Z] Executing 'Functions.ServiceBusQueueTrigger1' (Reason='New ServiceBus message detected on 'retry-test'.', Id=23f6f3db-5367-40e6-9f74-d118102d0f0a)
[2021-04-30T08:26:15.437Z] Trigger Details: MessageId: 2dfc99404faa430ba00c0ec128fe7433, DeliveryCount: 1, EnqueuedTime: 30/04/2021 08:26:06, LockedUntil: 30/04/2021 08:26:36, SessionId: (null)
[2021-04-30T08:26:15.445Z] Executed 'Functions.ServiceBusQueueTrigger1' (Failed, Id=23f6f3db-5367-40e6-9f74-d118102d0f0a, Duration=6ms)
[2021-04-30T08:26:15.445Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:15.445Z] Exception: Error: Pretend something went wrong and throw an error
...
[2021-04-30T08:26:15.448Z] Executing 'Functions.ServiceBusQueueTrigger1' (Reason='New ServiceBus message detected on 'retry-test'.', Id=c05df96c-140b-4072-88c0-f84bb5ac5c81)
[2021-04-30T08:26:15.448Z] Trigger Details: MessageId: 2dfc99404faa430ba00c0ec128fe7433, DeliveryCount: 1, EnqueuedTime: 30/04/2021 08:26:06, LockedUntil: 30/04/2021 08:26:36, SessionId: (null)
[2021-04-30T08:26:15.455Z] Executed 'Functions.ServiceBusQueueTrigger1' (Failed, Id=c05df96c-140b-4072-88c0-f84bb5ac5c81, Duration=4ms)
[2021-04-30T08:26:15.455Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:15.455Z] Exception: Error: Pretend something went wrong and throw an error
...
[2021-04-30T08:26:15.467Z] Message processing error (Action=UserCallback, ClientId=MessageReceiver1retry-test, EntityPath=retry-test, Endpoint=test-pfeifer.servicebus.windows.net)
[2021-04-30T08:26:15.467Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:15.467Z] Exception: Error: Pretend something went wrong and throw an error
...
[2021-04-30T08:26:15.566Z] Executing 'Functions.ServiceBusQueueTrigger1' (Reason='New ServiceBus message detected on 'retry-test'.', Id=b7753d57-bd80-405f-a3b7-0a4bd77c20ee)
[2021-04-30T08:26:15.566Z] Trigger Details: MessageId: 2dfc99404faa430ba00c0ec128fe7433, DeliveryCount: 2, EnqueuedTime: 30/04/2021 08:26:06, LockedUntil: 30/04/2021 08:26:45, SessionId: (null)
[2021-04-30T08:26:15.575Z] Executed 'Functions.ServiceBusQueueTrigger1' (Failed, Id=b7753d57-bd80-405f-a3b7-0a4bd77c20ee, Duration=2ms)
[2021-04-30T08:26:15.575Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:15.575Z] Exception: Error: Pretend something went wrong and throw an error
...
[2021-04-30T08:26:18.586Z] Executing 'Functions.ServiceBusQueueTrigger1' (Reason='New ServiceBus message detected on 'retry-test'.', Id=286b2d82-2ff6-4e09-b479-6b5456ca9f0c)
[2021-04-30T08:26:18.587Z] Trigger Details: MessageId: 2dfc99404faa430ba00c0ec128fe7433, DeliveryCount: 2, EnqueuedTime: 30/04/2021 08:26:06, LockedUntil: 30/04/2021 08:26:45, SessionId: (null)
[2021-04-30T08:26:18.603Z] Executed 'Functions.ServiceBusQueueTrigger1' (Failed, Id=286b2d82-2ff6-4e09-b479-6b5456ca9f0c, Duration=15ms)
[2021-04-30T08:26:18.603Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:18.603Z] Exception: Error: Pretend something went wrong and throw an error
...
[2021-04-30T08:26:24.643Z] Executing 'Functions.ServiceBusQueueTrigger1' (Reason='New ServiceBus message detected on 'retry-test'.', Id=2d5c6045-ee6d-40cd-b48a-c329689826c9)
[2021-04-30T08:26:24.643Z] Trigger Details: MessageId: 2dfc99404faa430ba00c0ec128fe7433, DeliveryCount: 2, EnqueuedTime: 30/04/2021 08:26:06, LockedUntil: 30/04/2021 08:26:45, SessionId: (null)
[2021-04-30T08:26:24.650Z] Executed 'Functions.ServiceBusQueueTrigger1' (Failed, Id=2d5c6045-ee6d-40cd-b48a-c329689826c9, Duration=5ms)
[2021-04-30T08:26:24.650Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:24.650Z] Exception: Error: Pretend something went wrong and throw an error
...
[2021-04-30T08:26:24.652Z] Executing 'Functions.ServiceBusQueueTrigger1' (Reason='New ServiceBus message detected on 'retry-test'.', Id=39871227-8a53-45d8-a003-ec3f03c8c2b5)
[2021-04-30T08:26:24.653Z] Trigger Details: MessageId: 2dfc99404faa430ba00c0ec128fe7433, DeliveryCount: 2, EnqueuedTime: 30/04/2021 08:26:06, LockedUntil: 30/04/2021 08:26:45, SessionId: (null)
[2021-04-30T08:26:24.658Z] Executed 'Functions.ServiceBusQueueTrigger1' (Failed, Id=39871227-8a53-45d8-a003-ec3f03c8c2b5, Duration=3ms)
[2021-04-30T08:26:24.658Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:24.658Z] Exception: Error: Pretend something went wrong and throw an error
...
[2021-04-30T08:26:24.662Z] Message processing error (Action=UserCallback, ClientId=MessageReceiver1retry-test, EntityPath=retry-test, Endpoint=test-pfeifer.servicebus.windows.net)
[2021-04-30T08:26:24.662Z] System.Private.CoreLib: Exception while executing function: Functions.ServiceBusQueueTrigger1. System.Private.CoreLib: Result: Failure
[2021-04-30T08:26:24.662Z] Exception: Error: Pretend something went wrong and throw an error
```
