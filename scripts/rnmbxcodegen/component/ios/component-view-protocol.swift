/***
to: ios/rnmbx/generated/<%= Name %>Protocol.swift
***/
/* Generated protocol used by Paper and <%= Name %>Manager. Methods must be implemented by the view <%= Name %>. */

@objc public protocol <%= Name %>Protocol {

// MARK: - events

<% component.events.forEach(function(event) { %>
  @objc func set<%= pascelCase(event.name) %>(_ callback: <%= event.bubblingType ? "RCTBubblingEventBlock" : "RCTDirectEventBlock" %>?);
<% }); %>

// MARK: - props

<% component.props.forEach(function(prop) { %>
    <% if (prop.typeAnnotation.type == "BooleanTypeAnnotation") { %>
      @objc func set<%= pascelCase(prop.name) %>(_ value: Bool);
    <% } %>
<% }); %>

<% module?.spec.properties.forEach(function (property) { %>
  @objc static func <%= property.name %>(_ view: <%= ComponentName %>, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock);
<% }) %>


}