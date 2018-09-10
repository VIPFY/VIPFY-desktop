import * as React from "react";

export default (props: { moveTo: Function; stage: number }) => (
  <div className="optionsSidebar">
    <div className="journeyHolder">
      <div className="journeyHeader">Your journey to your own company</div>
      <div
        className={props.stage > 1 ? "journeyDoneCircle" : "journeyCircle"}
        style={{
          position: "absolute",
          top: "4rem",
          left: "0rem"
        }}
        onClick={() => props.moveTo("/area/advisor")}>
        Facts about your company
      </div>
      <span
        style={{
          display: "block",
          position: "absolute",
          height: "1rem",
          width: "5.5rem",
          left: "3.5rem",
          top: "11rem",
          borderRadius: "0rem 1rem",
          borderBottom: "dotted",
          borderLeft: "dotted",
          borderColor: props.stage > 1 ? "#1CA543" : "white"
        }}
      />
      <div
        className="journeyCircle"
        style={{
          position: "absolute",
          top: "9rem",
          left: "9rem"
        }}
        onClick={() => props.moveTo("/area/advisor/personfacts")}>
        Facts about you
      </div>
      {/*<span
            style={{
              display: "block",
              position: "absolute",
              height: "4rem",
              width: "4.5rem",
              left: "8rem",
              borderBottom: "dotted white",
              borderRight: "dotted white",
              top: "16rem",
              borderRadius: "4rem 0rem"
            }}
          />
          <div
            className="journeyCircle"
            style={{
              position: "absolute",
              top: "17rem",
              left: "1rem"
            }}>
            Company Settings
          </div>
          <span
            style={{
              display: "block",
              position: "absolute",
              height: "4rem",
              width: "2.5rem",
              left: "4.5rem",
              borderBottom: "dotted white",
              borderLeft: "dotted white",
              top: "24rem",
              borderRadius: "0rem 2.5rem"
            }}
          />
          <div
            className="journeyCircle"
            style={{
              position: "absolute",
              top: "25rem",
              left: "7rem"
            }}>
            Your Account Settings
          </div>
          <span
            style={{
              display: "block",
              position: "absolute",
              height: "5rem",
              width: "3.5rem",
              left: "7rem",
              borderBottom: "dotted white",
              borderRight: "dotted white",
              top: "32rem",
              borderRadius: "3.5rem 0rem"
            }}
          />
          <div
            className="journeyCircle"
            style={{
              position: "absolute",
              top: "34rem",
              left: "0rem"
            }}>
            Service Settings
          </div>
          <span
            style={{
              display: "block",
              position: "absolute",
              height: "4rem",
              width: "5.5rem",
              left: "3.5rem",
              borderBottom: "dotted white",
              borderLeft: "dotted white",
              top: "41rem",
              borderRadius: "0rem 4rem"
            }}
          />*/}
      <span
        style={{
          display: "block",
          position: "absolute",
          height: "33rem",
          width: "0.5rem",
          left: "16rem",
          borderBottom: "dotted white",
          borderRight: "dotted white",
          borderTop: "dotted white",
          top: "12rem",
          borderRadius: "0rem 40rem 40rem 0rem"
        }}
      />
      <div
        className="journeyCircle"
        style={{
          position: "absolute",
          top: "42rem",
          left: "9rem"
        }}
        onClick={() => props.moveTo("/area/marketplace")}>
        Marketplace
      </div>
    </div>
  </div>
);
