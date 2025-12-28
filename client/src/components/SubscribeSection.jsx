import "./SubscribeSection.css";
function SubscribeSection() {
  return (
    <section className="subscribe">
      <h3>Be a part of my journey!</h3>
      <p>
        Get updates when I share something new which will be but not limited to reflections, lessons,
        and little victories along the way!!!
      </p>

      <div className="subscribe-btns">
        <button className="sub-btn">Subscribe</button>
        <button
          className="linkedin-btn"
          onClick={() =>
            window.open("https://www.linkedin.com/in/sahil-basumatary/", "_blank")
          }
        >
          Connect with me on LinkedIn
        </button>
      </div>
    </section>
  );
}

export default SubscribeSection;