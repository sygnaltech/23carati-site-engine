

We're implementing a new concept, called Functional Interactions (FIX).

It involved 3 concepts- 

- Event - is a label and dispatch mechanism
    - The label must conform to standard HTML ID formatting, e.g. no spaces 

- Trigger - is something that invokes an event, such as a mouse click

- Action - is something that occurs when it is performed by an event 


# Implementation

## HTML

Primarily through attributes, e.g.

<div trigger:click="event-1">Click me</div>   

<button action:click="event-1">I am a button</button>  


## Trigger Handlers

Should each be implemented as a TS class based on a common base class,
under /src/triggers 

- An init() method which performs the initialization
    - e.g. for trigger:click, it would be installing a JS click event handler 
- An invoke() method which is called when the trigger fires 
    - This then finds the event by name in the FIX event registry, and invokes it 

There will be many Trigger handlers in the future, such as click, scroll into view, exit intent, mouse enter, mouse exit, etc. 

## Event Handlers 

Should each be implemented as a TS class based on a common base class,
under /src/events

- An invoke() method which is called when the event is invoked ( by a bound trigger )
    - This then invokes each Action which is registered with the event 

Currently there is only a default event handler. 

## Action Handlers 

Should each be implemented as a TS class based on a common base class,
under /src/actions 

- An init() method which performs any initialization
- A trigger() method which is called when the event handler fires 
    - This then finds the event by name in the FIX event registry, and invokes it 

There will be many Action handlers in the future, such as click (performs a click on the tagged element)


# FIX Trigger-Event-Action Processing 

A trigger is typically invoked by a user or system event, such as a click, or a timer 

On invocation, 
- it composes the trigger data object 
- it locates the event name in the registry 
- it invoke()s it, passing
    - The trigger's element reference 
    - The trigger data object 

## Composing the Trigger Data Object 

Trigger data is also stored as attributes on the same element, and is prefixed by the trigger attribute name, plus :data, plus :(name)

e.g. trigger:click:data:slug = X
e.g. trigger:click:data:status-id = Y 

At the point a trigger is invoked, it examines the triggering element for these data attributes, and composes a data object; 

e.g. data object 
```
{
    "status-id": "Y",
    "slug" "X"
}
```

This is part of the event invocation, and is passed through to the actions as each action is invoked. 


# Page Processing 

- Find all elements with attributes that begin with trigger: or action: 
- Iterate through them 
    - Instantiate and init() the specified trigger class  
        - mapping should be done using TypeScript decorators, using the first two : separated parts only
            - e.g. trigger:click = TriggerClickHandler 
            - e.g. trigger:click-right = TriggerClickRightHandler 
        - for each trigger: attribute found, check the event registry for the event name specified as the value.  If it does not exist, create it using the default EventHandler class              
    - Instanticate and init() the specified action class
        - mapping should be done using TypeScript decorators, using the first two : separated parts only
            - e.g. action:click = ActionClickHandler 
            - e.g. action:click-right = ActionClickRightHandler 
        - for each action: attribute found, check the event registry for the event name specified as the value.  If it does not exist, create it, and register the Action handler object with it, for later invocation 


# Important Notes 

- In general, a Trigger will always be attached to some form of element. 

- Actions might be attached to an element, or they might not.  Some Actions might simply have a handler which is invoked directly, such as Actions which perform API calls. 
    - This means that somewhere in the SSE router or startup, we need a place to register these custom Actions with an event.  And/or this binding could also be a decorator for convenience. 


