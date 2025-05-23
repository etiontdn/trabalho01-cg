const scale = 1.2;
const duration = 20; // frames

const crosshair = {
    startFrame: 0,
    active: false,

    animate: function (renderer) {
        const crosshairEl = document.querySelector(".crosshair");

        if (this.active) {
            crosshairEl.style.transform = `scale(${scale})`;
            this.startFrame = renderer.info.render.frame;
            this.active = false;
        }

        let currentFrame = renderer.info.render.frame - this.startFrame;
        crosshairEl.style.transform = `scale(${
            scale - 0.2 * (currentFrame / duration)
        })`;

        if (currentFrame >= duration) {
            crosshairEl.style.transform = `scale(1)`;
        }
    },
};

export default crosshair;
