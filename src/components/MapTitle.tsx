import Control from "react-leaflet-custom-control";

export default function MapTitle() {
    return (
      <Control prepend={false} position="topleft">
        <div id="title">
        <h1>SoniMap v0.3.8</h1>
<p>Yet another Sonic Frontiers map</p>
<h2>Instructions</h2>
<p>Choose a map from the lower-left Map menu. Then, enable markers from the Marker Filter menu on the right.</p>
<h2>Limitations</h2>
<p>All map data is extracted from .gedit files, which I don't fully understand, so some data may be presented incorrectly.
Object coordinates should be accurate, but map placement may vary slightly due to not understanding map bounds and scaling.</p>
<h2>Comments?</h2>
<p>Message tashi on the Sonic Frontiers Speedrunning discord with any comments or questions.</p>
<p>Thanks to everyone at the Sonic Frontiers Speedrunning discord.</p>
<p><a href='https://github.com/tashiww/sonimap' rel="noreferrer" target='_blank'>Source code</a></p>
</div>
</Control>
    )
  }
