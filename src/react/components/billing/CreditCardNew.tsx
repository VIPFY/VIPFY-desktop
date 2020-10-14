import * as React from "react";
import { Card, CardSection } from "@vipfy-private/vipfy-ui-lib";

export default ({ brand, exp_month, exp_year, last4, name, remove, droppedOn, id }) => (
  <Card
    className="paymentCard"
    draggable="true"
    onDragStart={e => e.dataTransfer.setData("dragid", id)}
    onDrop={e => {
      console.log("TESTING DROP");
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      droppedOn(e.dataTransfer.getData("dragid"), id);
    }}
    onDragOver={e => {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }
    }}>
    <CardSection className="cardProvider">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="creditCardIcon">
          <div className={`background ${brand.toLowerCase()}`} />
          <div className={`logo ${brand.toLowerCase()}`} />
        </div>
        <span>{brand}</span>
      </div>
      <div className="closeButton" onClick={() => remove()}>
        <i className="fal fa-trash-alt"></i>
      </div>
    </CardSection>

    <CardSection>
      <div className="cardName">{name}</div>
      <div className="creditCardNumber">
        <span>****</span>
        <div className="starSeperator" />
        <span>****</span>
        <div className="starSeperator" />
        <span>****</span>
        <div className="starSeperator" />
        <span>{last4}</span>
      </div>
      <div className="cardUntil">
        {exp_month}/{exp_year}
      </div>
    </CardSection>
  </Card>
);
