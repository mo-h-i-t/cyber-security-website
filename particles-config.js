// Initialize particles.js for the 3D background
particlesJS('particles-js', {
    "particles": {
        "number": {
            "value": 150,
            "density": {
                "enable": true,
                "value_area": 500
            }
        },
        "color": {
            "value": "#0fca34"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000 , #00b7ff , #00b7ff,#ffffff"
            }
        },
        "opacity": {
            "value": 0.8,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 5,
                "opacity_min": 0.5,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 5,
                "size_min": 0.3,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 200,
            "color": "#00b7ff",  
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 5,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "grab"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 100,
                "line_linked": {
                    "opacity": 1
                }
            },
            "push": {
                "particles_nb": 4
            }
        }
    },
    "retina_detect": true
});

