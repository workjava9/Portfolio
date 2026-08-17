(() => {
    "use strict";

    const documentRoot = document.documentElement;
    const documentBody = document.body;
    const mainContent = document.querySelector("#main-content");
    const portfolioFooter = document.querySelector(".portfolio-footer");
    const portfolioHeader = document.querySelector("[data-header]");
    const navigationToggle = document.querySelector("[data-nav-toggle]");
    const navigationPanel = document.querySelector("[data-nav-panel]");
    const navigationLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const routeProgress = document.querySelector("[data-route-progress]");
    const routeLinks = Array.from(document.querySelectorAll("[data-route-link]"));
    const routeProgressFill = document.querySelector("[data-route-progress-fill]");
    const systemSections = Array.from(document.querySelectorAll("[data-section]"));
    const choreographyElements = Array.from(document.querySelectorAll(".choreography-item"));
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const architectureStage = document.querySelector("[data-architecture-stage]");
    const architectureIndex = document.querySelector("[data-architecture-index]");
    const architectureStatus = document.querySelector("[data-architecture-status]");
    const architectureNodes = Array.from(document.querySelectorAll("[data-architecture-node]"));
    const architectureMotions = Array.from(document.querySelectorAll("[data-architecture-motion]"));
    const heroTechnologyModules = Array.from(document.querySelectorAll("[data-hero-tech]"));

    const profileMap = document.querySelector("[data-profile-map]");
    const profileLabel = document.querySelector("[data-profile-label]");
    const profileTechnologies = document.querySelector("[data-profile-technologies]");
    const profileNodes = Array.from(document.querySelectorAll("[data-profile-node]"));
    const profileRoutes = Array.from(document.querySelectorAll("[data-profile-route]"));

    const technologyMap = document.querySelector("[data-technology-map]");
    const technologyDomains = Array.from(document.querySelectorAll("[data-technology-domain]"));
    const technologyDomainControls = Array.from(document.querySelectorAll("[data-technology-domain-control]"));
    const technologyRoutes = Array.from(document.querySelectorAll("[data-domain-route]"));
    const projectCards = Array.from(document.querySelectorAll("[data-project-flow]"));

    const contactSection = document.querySelector("#contact");
    const sectionBurst = document.querySelector("[data-section-burst]");

    documentRoot.classList.add("motion-ready");

    const clamp = (number, minimum, maximum) => Math.min(Math.max(number, minimum), maximum);
    const hexadecimalToRgb = (hexadecimalColor) => {
        const colorValue = Number.parseInt(hexadecimalColor.slice(1), 16);
        return {
            red: (colorValue >> 16) & 255,
            green: (colorValue >> 8) & 255,
            blue: colorValue & 255
        };
    };
    const rgba = (hexadecimalColor, alpha) => {
        const { red, green, blue } = hexadecimalToRgb(hexadecimalColor);
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    };
    const createSeededRandom = (seed) => {
        let currentSeed = seed >>> 0;
        return () => {
            currentSeed = (Math.imul(currentSeed, 1664525) + 1013904223) >>> 0;
            return currentSeed / 4294967296;
        };
    };

    const sectionThemes = {
        top: { primary: "#68efad", secondary: "#57d7e9", burst: [0.79, 0.34] },
        about: { primary: "#68efad", secondary: "#3cc9bf", burst: [0.82, 0.44] },
        projects: { primary: "#f2b85b", secondary: "#57d7e9", burst: [0.18, 0.3] },
        stack: { primary: "#aa91f5", secondary: "#6c98ff", burst: [0.76, 0.48] },
        experience: { primary: "#57d7e9", secondary: "#6c98ff", burst: [0.28, 0.56] },
        education: { primary: "#6c98ff", secondary: "#aa91f5", burst: [0.72, 0.42] },
        contact: { primary: "#68efad", secondary: "#6c98ff", burst: [0.5, 0.5] }
    };

    const motionState = {
        activeSection: "",
        currentScrollY: Math.max(window.scrollY, 0),
        previousFrameScrollY: Math.max(window.scrollY, 0),
        lastFrameTime: performance.now(),
        lastScrollEventTime: 0,
        direction: 1,
        targetEnergy: 0,
        energy: 0,
        reduced: reducedMotionQuery.matches,
        visible: !document.hidden,
        scrollDirty: true,
        pointerDirty: false,
        pointerTarget: null,
        frameId: 0,
        frameTimerId: 0,
        reducedFrameId: 0
    };

    class DataConstellation {
        constructor(canvas) {
            this.canvas = canvas;
            this.context = canvas?.getContext("2d", { alpha: true }) || null;
            this.width = 0;
            this.height = 0;
            this.dpr = 1;
            this.nodes = [];
            this.meteors = [];
            this.safeZones = [];
            this.palette = sectionThemes.top;
            this.lastDrawTime = 0;
            this.meteorCooldown = 900;
            this.runtimeRandom = createSeededRandom(918273);
        }

        resize() {
            if (!this.context || !this.canvas) {
                return;
            }

            this.width = Math.max(window.innerWidth, 1);
            this.height = Math.max(window.innerHeight, 1);
            const dprLimit = this.width >= 1100 ? 1.5 : this.width >= 700 ? 1.35 : 1.25;
            this.dpr = Math.min(window.devicePixelRatio || 1, dprLimit);
            this.canvas.width = Math.round(this.width * this.dpr);
            this.canvas.height = Math.round(this.height * this.dpr);
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
            this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

            const nodeCount = this.width >= 1200 ? 110 : this.width >= 700 ? 68 : 38;
            const meteorCount = this.width >= 1200 ? 3 : this.width >= 700 ? 2 : 1;
            const seededRandom = createSeededRandom(49201 + nodeCount);
            this.nodes = Array.from({ length: nodeCount }, (_, nodeIndex) => {
                const colorRoll = seededRandom();
                const color = colorRoll < 0.72
                    ? "#c0cec8"
                    : colorRoll < 0.83
                        ? "#68efad"
                        : colorRoll < 0.91
                            ? "#57d7e9"
                            : colorRoll < 0.98
                                ? "#6c98ff"
                                : "#f2b85b";
                return {
                    x: seededRandom(),
                    y: seededRandom(),
                    depth: 0.35 + seededRandom() * 0.9,
                    radius: 0.65 + seededRandom() * 1.45,
                    alpha: 0.16 + seededRandom() * 0.48,
                    phase: seededRandom() * Math.PI * 2,
                    color,
                    bright: seededRandom() > 0.9,
                    shape: nodeIndex % 17 === 0 ? "ring" : nodeIndex % 23 === 0 ? "cross" : "point"
                };
            });
            this.meteors = Array.from({ length: meteorCount }, () => ({ active: false }));
            this.lastDrawTime = 0;
        }

        setPalette(theme) {
            this.palette = theme || sectionThemes.top;
        }

        setSafeZones(safeZones) {
            this.safeZones = safeZones;
        }

        resolveNodePosition(node, scrollY, staticFrame) {
            const parallaxOffset = staticFrame ? 0 : scrollY * 0.012 * node.depth;
            const wrappedHeight = this.height + 40;
            const y = ((node.y * this.height - parallaxOffset + wrappedHeight + 20) % wrappedHeight) - 20;
            return { x: node.x * this.width, y };
        }

        safeZoneAlpha(x, y, scrollY) {
            for (const safeZone of this.safeZones) {
                const viewportTop = safeZone.top - scrollY;
                const viewportBottom = safeZone.bottom - scrollY;
                if (
                    x >= safeZone.left - 28 &&
                    x <= safeZone.right + 28 &&
                    y >= viewportTop - 24 &&
                    y <= viewportBottom + 24
                ) {
                    return 0;
                }
            }
            return 1;
        }

        spawnMeteor(direction, energy) {
            const meteor = this.meteors.find((candidate) => !candidate.active);
            if (!meteor) {
                return;
            }

            meteor.active = true;
            meteor.direction = direction;
            meteor.x = this.width * (0.08 + this.runtimeRandom() * 0.84);
            meteor.y = direction > 0 ? -90 : this.height + 90;
            meteor.drift = (this.runtimeRandom() - 0.5) * 0.08;
            meteor.speed = 0.15 + this.runtimeRandom() * 0.13 + energy * 0.12;
            meteor.length = 34 + this.runtimeRandom() * 58;
            meteor.color = this.runtimeRandom() > 0.75 ? this.palette.secondary : this.palette.primary;
            meteor.alpha = 0.24 + this.runtimeRandom() * 0.34;
        }

        drawConnections(scrollY, staticFrame) {
            const context = this.context;
            for (let nodeIndex = 0; nodeIndex < this.nodes.length - 6; nodeIndex += 9) {
                const sourceNode = this.nodes[nodeIndex];
                const targetNode = this.nodes[nodeIndex + 6];
                const source = this.resolveNodePosition(sourceNode, scrollY, staticFrame);
                const target = this.resolveNodePosition(targetNode, scrollY, staticFrame);
                const distance = Math.hypot(target.x - source.x, target.y - source.y);
                if (distance > Math.min(this.width * 0.24, 230)) {
                    continue;
                }

                const safeAlpha = Math.min(
                    this.safeZoneAlpha(source.x, source.y, scrollY),
                    this.safeZoneAlpha(target.x, target.y, scrollY)
                );
                const elbowX = source.x + (target.x - source.x) * 0.5;
                context.beginPath();
                context.moveTo(source.x, source.y);
                context.lineTo(elbowX, source.y);
                context.lineTo(elbowX, target.y);
                context.lineTo(target.x, target.y);
                context.strokeStyle = rgba(this.palette.secondary, 0.055 * safeAlpha);
                context.lineWidth = 0.7;
                context.stroke();
            }
        }

        drawNodes(timestamp, scrollY, energy, staticFrame) {
            const context = this.context;
            this.nodes.forEach((node) => {
                const position = this.resolveNodePosition(node, scrollY, staticFrame);
                const safeAlpha = this.safeZoneAlpha(position.x, position.y, scrollY);
                const pulse = staticFrame ? 0.8 : 0.74 + Math.sin(timestamp * 0.0012 + node.phase) * 0.2;
                const nodeAlpha = node.alpha * pulse * safeAlpha * (0.78 + energy * 0.32);

                if (node.bright && safeAlpha > 0.2) {
                    context.beginPath();
                    context.arc(position.x, position.y, node.radius * 4.2, 0, Math.PI * 2);
                    context.fillStyle = rgba(node.color, nodeAlpha * 0.08);
                    context.fill();
                }

                context.beginPath();
                if (node.shape === "ring") {
                    context.arc(position.x, position.y, node.radius * 2.4, 0, Math.PI * 2);
                    context.strokeStyle = rgba(node.color, nodeAlpha * 0.78);
                    context.lineWidth = 0.7;
                    context.stroke();
                    return;
                }
                if (node.shape === "cross") {
                    const crossRadius = node.radius * 2.7;
                    context.moveTo(position.x - crossRadius, position.y);
                    context.lineTo(position.x + crossRadius, position.y);
                    context.moveTo(position.x, position.y - crossRadius);
                    context.lineTo(position.x, position.y + crossRadius);
                    context.strokeStyle = rgba(node.color, nodeAlpha * 0.82);
                    context.lineWidth = 0.7;
                    context.stroke();
                    return;
                }

                context.arc(position.x, position.y, node.radius, 0, Math.PI * 2);
                context.fillStyle = rgba(node.color, nodeAlpha);
                context.fill();
            });
        }

        drawMeteors(elapsedTime, direction, energy, scrollY) {
            const context = this.context;
            this.meteorCooldown -= elapsedTime;
            if (this.meteorCooldown <= 0) {
                this.spawnMeteor(direction, energy);
                this.meteorCooldown = energy > 0.12
                    ? 460 + (1 - energy) * 520
                    : 2700 + this.runtimeRandom() * 2100;
            }

            this.meteors.forEach((meteor) => {
                if (!meteor.active) {
                    return;
                }
                meteor.direction = direction;
                const speed = meteor.speed * (0.78 + energy * 1.45);
                meteor.y += meteor.direction * speed * elapsedTime;
                meteor.x += meteor.drift * speed * elapsedTime;
                const tailY = meteor.y - meteor.direction * meteor.length;
                const tailX = meteor.x - meteor.drift * meteor.length;
                const safeAlpha = Math.min(
                    this.safeZoneAlpha(meteor.x, meteor.y, scrollY),
                    this.safeZoneAlpha(tailX, tailY, scrollY)
                );
                const gradient = context.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
                gradient.addColorStop(0, rgba(meteor.color, 0));
                gradient.addColorStop(1, rgba(meteor.color, meteor.alpha * safeAlpha));
                context.beginPath();
                context.moveTo(tailX, tailY);
                context.lineTo(meteor.x, meteor.y);
                context.strokeStyle = gradient;
                context.lineWidth = 1;
                context.stroke();
                context.beginPath();
                context.arc(meteor.x, meteor.y, 1.45, 0, Math.PI * 2);
                context.fillStyle = rgba(meteor.color, meteor.alpha * 0.9 * safeAlpha);
                context.fill();

                if (meteor.y > this.height + 120 || meteor.y < -120 || meteor.x < -120 || meteor.x > this.width + 120) {
                    meteor.active = false;
                }
            });
        }

        clearSafeZones(scrollY) {
            this.safeZones.forEach((safeZone) => {
                const viewportTop = safeZone.top - scrollY;
                this.context.clearRect(
                    safeZone.left - 30,
                    viewportTop - 26,
                    safeZone.right - safeZone.left + 60,
                    safeZone.bottom - safeZone.top + 52
                );
            });
        }

        draw(timestamp, scrollY, energy, direction, staticFrame = false) {
            if (!this.context || !this.width || !this.height) {
                return;
            }

            const targetFrameRate = staticFrame ? 1 : energy > 0.08
                ? 60
                : this.width < 700
                    ? 24
                    : 30;
            const minimumFrameTime = 1000 / targetFrameRate;
            if (!staticFrame && timestamp - this.lastDrawTime < minimumFrameTime) {
                return;
            }

            const elapsedTime = this.lastDrawTime ? Math.min(timestamp - this.lastDrawTime, 64) : 16;
            this.lastDrawTime = timestamp;
            this.context.clearRect(0, 0, this.width, this.height);
            this.drawConnections(scrollY, staticFrame);
            this.drawNodes(timestamp, scrollY, energy, staticFrame);
            if (!staticFrame) {
                this.drawMeteors(elapsedTime, direction, energy, scrollY);
            }
            this.clearSafeZones(scrollY);
        }

        drawStatic(scrollY = window.scrollY) {
            this.meteors.forEach((meteor) => {
                meteor.active = false;
            });
            this.lastDrawTime = 0;
            this.draw(0, scrollY, 0, 1, true);
        }
    }

    const dataField = new DataConstellation(document.querySelector("[data-data-field]"));
    let sectionMetrics = [];
    let lastDocumentProgress = "";
    let lastRenderedEnergy = -1;
    let lastRenderedShift = "";
    let layoutFrameId = 0;
    let navigationPreviousFocus = null;
    let burstFrameId = 0;
    let burstTimerId = 0;
    let contactFrameId = 0;
    let contactTimerId = 0;
    let navigationFocusTimerId = 0;

    const setBackgroundSafeZones = () => {
        const safeZoneSelectors = [
            ".portfolio-header",
            ".hero__content",
            ".technology-module",
            ".architecture-stage",
            ".section-heading",
            ".about__copy",
            ".profile-map",
            ".project-card",
            ".technology-domain",
            ".technology-map__core",
            ".route-card",
            ".contact__inner"
        ];
        const safeZones = safeZoneSelectors.flatMap((selector) =>
            Array.from(document.querySelectorAll(selector)).map((element) => {
                const bounds = element.getBoundingClientRect();
                return {
                    top: bounds.top + window.scrollY,
                    bottom: bounds.bottom + window.scrollY,
                    left: bounds.left,
                    right: bounds.right
                };
            })
        );
        dataField.setSafeZones(safeZones);
    };

    const cacheLayout = () => {
        sectionMetrics = systemSections.map((section) => {
            const sectionBounds = section.getBoundingClientRect();
            return {
                element: section,
                top: sectionBounds.top + window.scrollY,
                height: Math.max(sectionBounds.height, 1),
                renderedProgress: ""
            };
        });

        setBackgroundSafeZones();
        motionState.scrollDirty = true;
    };

    const restartSectionBurst = (sectionId) => {
        if (motionState.reduced || !sectionBurst) {
            return;
        }

        const theme = sectionThemes[sectionId] || sectionThemes.top;
        sectionBurst.style.setProperty("--burst-x", `${theme.burst[0] * 100}vw`);
        sectionBurst.style.setProperty("--burst-y", `${theme.burst[1] * 100}vh`);
        sectionBurst.style.setProperty("--burst-color", theme.primary);
        window.cancelAnimationFrame(burstFrameId);
        window.clearTimeout(burstTimerId);
        documentBody.classList.remove("is-section-activating");
        burstFrameId = window.requestAnimationFrame(() => {
            documentBody.classList.add("is-section-activating");
            burstTimerId = window.setTimeout(() => {
                documentBody.classList.remove("is-section-activating");
            }, 620);
        });
    };

    const restartContactCrescendo = () => {
        if (motionState.reduced || !contactSection) {
            return;
        }
        window.cancelAnimationFrame(contactFrameId);
        window.clearTimeout(contactTimerId);
        contactSection.classList.remove("is-contact-active");
        contactFrameId = window.requestAnimationFrame(() => {
            contactSection.classList.add("is-contact-active");
            contactTimerId = window.setTimeout(() => {
                contactSection.classList.remove("is-contact-active");
            }, 1400);
        });
    };

    const setActiveSection = (sectionId) => {
        if (!sectionId || motionState.activeSection === sectionId) {
            return;
        }

        motionState.activeSection = sectionId;
        documentBody.dataset.activeSection = sectionId;
        [...navigationLinks, ...routeLinks].forEach((link) => {
            const linkTarget = link.getAttribute("href")?.slice(1);
            if (linkTarget === sectionId) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
        dataField.setPalette(sectionThemes[sectionId] || sectionThemes.top);
        restartSectionBurst(sectionId);
        if (sectionId === "contact") {
            restartContactCrescendo();
        }
        if (motionState.reduced) {
            dataField.drawStatic();
        }
    };

    const updateDocumentRoute = (currentScrollY) => {
        const maximumScrollPosition = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const documentProgress = clamp(currentScrollY / maximumScrollPosition, 0, 1);
        const nextDocumentProgress = documentProgress.toFixed(4);
        if (routeProgressFill && nextDocumentProgress !== lastDocumentProgress) {
            routeProgressFill.style.setProperty("--route-progress", nextDocumentProgress);
            lastDocumentProgress = nextDocumentProgress;
        }

        const viewportAnchor = currentScrollY + window.innerHeight * 0.56;
        let activeMetric = sectionMetrics[0];
        sectionMetrics.forEach((sectionMetric) => {
            const sectionProgress = clamp(
                (currentScrollY + window.innerHeight * 0.72 - sectionMetric.top) /
                    Math.max(sectionMetric.height * 0.9, 1),
                0,
                1
            );
            const nextSectionProgress = sectionProgress.toFixed(3);
            if (nextSectionProgress !== sectionMetric.renderedProgress) {
                sectionMetric.element.style.setProperty("--section-progress", nextSectionProgress);
                sectionMetric.renderedProgress = nextSectionProgress;
            }
            if (viewportAnchor >= sectionMetric.top) {
                activeMetric = sectionMetric;
            }
        });
        setActiveSection(activeMetric?.element.id || "top");
    };

    const renderPointerDepth = () => {
        const pointerTarget = motionState.pointerTarget;
        if (!motionState.pointerDirty || !pointerTarget || motionState.reduced || !finePointerQuery.matches) {
            return;
        }

        motionState.pointerDirty = false;
        if (pointerTarget.type === "stage") {
            pointerTarget.element.style.setProperty("--stage-rotate-y", `${((pointerTarget.x - 0.5) * 5).toFixed(2)}deg`);
            pointerTarget.element.style.setProperty("--stage-rotate-x", `${((0.5 - pointerTarget.y) * 4).toFixed(2)}deg`);
            pointerTarget.element.style.setProperty("--stage-shift-x", `${((pointerTarget.x - 0.5) * 5).toFixed(2)}px`);
            pointerTarget.element.style.setProperty("--stage-shift-y", `${((pointerTarget.y - 0.5) * 5).toFixed(2)}px`);
            return;
        }

        pointerTarget.element.style.setProperty("--pointer-x", `${(pointerTarget.x * 100).toFixed(1)}%`);
        pointerTarget.element.style.setProperty("--pointer-y", `${(pointerTarget.y * 100).toFixed(1)}%`);
        pointerTarget.element.style.setProperty("--card-rotate-y", `${((pointerTarget.x - 0.5) * 2.8).toFixed(2)}deg`);
        pointerTarget.element.style.setProperty("--card-rotate-x", `${((0.5 - pointerTarget.y) * 2.4).toFixed(2)}deg`);
    };

    const scheduleRuntimeFrame = (immediate = false) => {
        if (!motionState.visible || motionState.reduced || motionState.frameId) {
            return;
        }

        if (motionState.frameTimerId) {
            if (!immediate) {
                return;
            }
            window.clearTimeout(motionState.frameTimerId);
            motionState.frameTimerId = 0;
        }

        const highFrequencyFrame = immediate
            || motionState.energy > 0.008
            || performance.now() - motionState.lastScrollEventTime < 180
            || motionState.pointerDirty;
        if (highFrequencyFrame) {
            motionState.frameId = window.requestAnimationFrame(renderFrame);
            return;
        }

        const idleDelay = window.innerWidth < 700 ? 34 : 25;
        motionState.frameTimerId = window.setTimeout(() => {
            motionState.frameTimerId = 0;
            if (motionState.visible && !motionState.reduced && !motionState.frameId) {
                motionState.frameId = window.requestAnimationFrame(renderFrame);
            }
        }, idleDelay);
    };

    const renderFrame = (timestamp, singleFrame = false) => {
        motionState.frameId = 0;
        motionState.reducedFrameId = 0;
        if (!motionState.visible) {
            return;
        }

        const elapsedTime = clamp(timestamp - motionState.lastFrameTime, 8, 64);
        const currentScrollY = Math.max(window.scrollY, 0);
        const scrollDifference = currentScrollY - motionState.previousFrameScrollY;
        if (Math.abs(scrollDifference) > 2) {
            motionState.direction = scrollDifference > 0 ? 1 : -1;
            documentBody.dataset.scrollDirection = motionState.direction > 0 ? "down" : "up";
        }

        const rawVelocity = scrollDifference / Math.max(elapsedTime, 16);
        motionState.targetEnergy = timestamp - motionState.lastScrollEventTime < 140
            ? clamp(Math.abs(rawVelocity) / 1.6, 0, 1)
            : 0;
        const energyResponse = motionState.targetEnergy > motionState.energy ? 0.018 : 0.006;
        motionState.energy += (motionState.targetEnergy - motionState.energy) * (1 - Math.exp(-elapsedTime * energyResponse));
        if (motionState.energy < 0.002 && motionState.targetEnergy === 0) {
            motionState.energy = 0;
        }

        const scrollSessionActive = !motionState.reduced
            && timestamp - motionState.lastScrollEventTime < 160
            && motionState.energy > 0.008;
        documentBody.classList.toggle("is-scroll-active", scrollSessionActive);
        portfolioHeader?.classList.toggle("is-scrolled", currentScrollY > 18);

        const nextEnergy = motionState.energy.toFixed(3);
        if (Math.abs(Number(nextEnergy) - lastRenderedEnergy) > 0.002) {
            documentRoot.style.setProperty("--scroll-energy", nextEnergy);
            lastRenderedEnergy = Number(nextEnergy);
        }
        const nextBackgroundShift = `${(currentScrollY * 0.28).toFixed(1)}px`;
        if (nextBackgroundShift !== lastRenderedShift) {
            documentRoot.style.setProperty("--background-shift", nextBackgroundShift);
            lastRenderedShift = nextBackgroundShift;
        }

        if (motionState.scrollDirty || Math.abs(scrollDifference) > 0.2) {
            updateDocumentRoute(currentScrollY);
            motionState.scrollDirty = false;
        }
        renderPointerDepth();
        if (!motionState.reduced) {
            dataField.draw(timestamp, currentScrollY, motionState.energy, motionState.direction);
        }

        motionState.currentScrollY = currentScrollY;
        motionState.previousFrameScrollY = currentScrollY;
        motionState.lastFrameTime = timestamp;
        if (!singleFrame && !motionState.reduced && motionState.visible) {
            scheduleRuntimeFrame();
        }
    };

    const renderReducedScrollState = () => {
        motionState.reducedFrameId = 0;
        if (!motionState.visible || !motionState.reduced) {
            return;
        }

        const currentScrollY = Math.max(window.scrollY, 0);
        portfolioHeader?.classList.toggle("is-scrolled", currentScrollY > 18);
        const viewportAnchor = currentScrollY + window.innerHeight * 0.56;
        let activeMetric = sectionMetrics[0];
        sectionMetrics.forEach((sectionMetric) => {
            if (viewportAnchor >= sectionMetric.top) {
                activeMetric = sectionMetric;
            }
        });
        setActiveSection(activeMetric?.element.id || "top");
        motionState.currentScrollY = currentScrollY;
        motionState.previousFrameScrollY = currentScrollY;
        motionState.scrollDirty = false;
    };

    const requestReducedFrame = () => {
        if (!motionState.reducedFrameId && motionState.visible) {
            motionState.reducedFrameId = window.requestAnimationFrame(renderReducedScrollState);
        }
    };

    const startRuntime = () => {
        if (motionState.visible && !motionState.reduced) {
            motionState.lastFrameTime = performance.now();
            motionState.previousFrameScrollY = Math.max(window.scrollY, 0);
            scheduleRuntimeFrame(true);
        }
    };

    const playArchitectureFlow = (flowName) => {
        if (motionState.reduced) {
            return;
        }
        architectureMotions
            .filter((motion) => motion.dataset.architectureMotion === flowName)
            .forEach((motion) => {
                if (typeof motion.beginElement === "function") {
                    motion.beginElement();
                }
            });
    };

    const architectureMessages = {
        client: ["00 / CLIENT", "Authenticated HTTP request"],
        api: ["01 / REST API", "Validation and security boundary"],
        spring: ["02 / SPRING BOOT", "Business logic and orchestration"],
        kafka: ["03 / KAFKA", "Events, retry and DLQ"],
        postgres: ["04 / POSTGRESQL", "Transactional persistence"],
        redis: ["05 / REDIS", "Low-latency cache"]
    };
    const architectureFlowTargets = {
        client: "request",
        api: "request",
        spring: "request",
        kafka: "event",
        postgres: "data",
        redis: "data"
    };
    const heroTechnologyTargets = {
        java: "spring",
        spring: "api",
        kafka: "kafka",
        postgres: "postgres"
    };

    const activateArchitectureNode = (nodeName, replayFlow = true) => {
        const selectedArchitecture = architectureMessages[nodeName];
        if (!architectureStage || !selectedArchitecture) {
            return;
        }

        architectureStage.dataset.activeNode = nodeName;
        architectureNodes.forEach((node) => {
            const nodeIsActive = node.dataset.architectureNode === nodeName;
            node.classList.toggle("is-active", nodeIsActive);
            node.setAttribute("aria-pressed", String(nodeIsActive));
        });
        if (architectureIndex) {
            architectureIndex.textContent = selectedArchitecture[0];
        }
        if (architectureStatus) {
            architectureStatus.textContent = selectedArchitecture[1];
        }
        if (replayFlow) {
            playArchitectureFlow(architectureFlowTargets[nodeName]);
        }
    };

    const activateHeroTechnology = (technologyName) => {
        const targetNode = heroTechnologyTargets[technologyName];
        if (!targetNode) {
            return;
        }
        heroTechnologyModules.forEach((module) => {
            const moduleIsActive = module.dataset.heroTech === technologyName;
            module.classList.toggle("is-active", moduleIsActive);
            module.setAttribute("aria-pressed", String(moduleIsActive));
        });
        activateArchitectureNode(targetNode);
    };

    const profileDetails = {
        core: ["CORE", "Java Core · Collections · Generics · Concurrency"],
        spring: ["SPRING", "Spring Boot · Spring Security · Spring Data JPA · REST API"],
        data: ["DATA", "PostgreSQL · MySQL · Oracle · Redis · Liquibase"],
        testing: ["TESTING", "JUnit 5 · Mockito · Spring Boot Test · Testcontainers"],
        infra: ["INFRA", "Docker · Docker Compose · Kubernetes · Linux · CI/CD"],
        events: ["EVENTS", "Kafka · RabbitMQ · Producer / Consumer · Retry · DLQ"]
    };

    const activateProfileNode = (profileName) => {
        const selectedProfile = profileDetails[profileName];
        if (!profileMap || !selectedProfile) {
            return;
        }

        profileMap.dataset.activeProfile = profileName;
        profileNodes.forEach((node) => {
            const nodeIsActive = node.dataset.profileNode === profileName;
            node.classList.toggle("is-active", nodeIsActive);
            node.setAttribute("aria-pressed", String(nodeIsActive));
        });
        profileRoutes.forEach((route) => {
            route.classList.toggle("is-active", route.dataset.profileRoute === profileName);
        });
        if (profileLabel) {
            profileLabel.textContent = selectedProfile[0];
        }
        if (profileTechnologies) {
            profileTechnologies.textContent = selectedProfile[1];
        }
    };

    const activateTechnologyDomain = (domainName) => {
        if (!technologyMap || !domainName) {
            return;
        }

        technologyMap.dataset.activeDomain = domainName;
        technologyDomains.forEach((domain) => {
            const domainIsActive = domain.dataset.technologyDomain === domainName;
            domain.classList.toggle("is-active", domainIsActive);
        });
        technologyDomainControls.forEach((control) => {
            const domainIsActive = control.dataset.technologyDomainControl === domainName;
            control.setAttribute("aria-pressed", String(domainIsActive));
        });
        technologyRoutes.forEach((route) => {
            route.classList.toggle("is-active", route.dataset.domainRoute === domainName);
        });
    };

    const projectFlowRuntime = new WeakMap();
    const playProjectFlow = (projectCard) => {
        if (motionState.reduced || !projectCard) {
            return;
        }

        const previousRuntime = projectFlowRuntime.get(projectCard);
        if (previousRuntime) {
            window.cancelAnimationFrame(previousRuntime.frameId);
            previousRuntime.timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
        }
        projectCard.classList.remove("is-flow-active");
        const runtime = { frameId: 0, timeouts: [] };
        runtime.frameId = window.requestAnimationFrame(() => {
            projectCard.classList.add("is-flow-active");
            projectCard.querySelectorAll("[data-project-motion]").forEach((motion, motionIndex) => {
                const timeoutId = window.setTimeout(() => {
                    if (typeof motion.beginElement === "function") {
                        motion.beginElement();
                    }
                }, motionIndex * 90);
                runtime.timeouts.push(timeoutId);
            });
            runtime.timeouts.push(window.setTimeout(() => {
                projectCard.classList.remove("is-flow-active");
            }, 1320));
        });
        projectFlowRuntime.set(projectCard, runtime);
    };

    const bindProjectFlows = () => {
        const playedProjects = new WeakSet();
        if ("IntersectionObserver" in window) {
            const projectObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !playedProjects.has(entry.target)) {
                        playedProjects.add(entry.target);
                        playProjectFlow(entry.target);
                    }
                });
            }, { rootMargin: "0px 0px -12% 0px", threshold: 0.3 });
            projectCards.forEach((projectCard) => projectObserver.observe(projectCard));
        }

        projectCards.forEach((projectCard) => {
            projectCard.addEventListener("pointerenter", () => playProjectFlow(projectCard));
            projectCard.addEventListener("focusin", () => playProjectFlow(projectCard));
            projectCard.addEventListener("pointerdown", () => playProjectFlow(projectCard), { passive: true });
        });
    };

    const resetPointerDepth = () => {
        const pointerTarget = motionState.pointerTarget;
        if (!pointerTarget) {
            return;
        }
        pointerTarget.element.classList.remove("is-pointer-active");
        if (pointerTarget.type === "stage") {
            pointerTarget.element.style.setProperty("--stage-rotate-x", "0deg");
            pointerTarget.element.style.setProperty("--stage-rotate-y", "0deg");
            pointerTarget.element.style.setProperty("--stage-shift-x", "0px");
            pointerTarget.element.style.setProperty("--stage-shift-y", "0px");
        } else {
            pointerTarget.element.style.setProperty("--card-rotate-x", "0deg");
            pointerTarget.element.style.setProperty("--card-rotate-y", "0deg");
        }
        motionState.pointerTarget = null;
        motionState.pointerDirty = false;
    };

    const bindPointerDepth = (element, type) => {
        if (!element) {
            return;
        }
        element.addEventListener("pointerenter", () => {
            if (motionState.reduced || !finePointerQuery.matches) {
                return;
            }
            resetPointerDepth();
            motionState.pointerTarget = {
                element,
                type,
                bounds: element.getBoundingClientRect(),
                x: 0.5,
                y: 0.5
            };
            element.classList.add("is-pointer-active");
        });
        element.addEventListener("pointermove", (event) => {
            const pointerTarget = motionState.pointerTarget;
            if (!pointerTarget || pointerTarget.element !== element) {
                return;
            }
            pointerTarget.x = clamp((event.clientX - pointerTarget.bounds.left) / Math.max(pointerTarget.bounds.width, 1), 0, 1);
            pointerTarget.y = clamp((event.clientY - pointerTarget.bounds.top) / Math.max(pointerTarget.bounds.height, 1), 0, 1);
            motionState.pointerDirty = true;
            scheduleRuntimeFrame(true);
        }, { passive: true });
        element.addEventListener("pointerleave", resetPointerDepth);
    };

    const observeChoreography = () => {
        if (!("IntersectionObserver" in window)) {
            choreographyElements.forEach((element) => element.classList.add("is-choreography-visible"));
            return;
        }

        const choreographyObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (motionState.reduced) {
                    entry.target.classList.add("is-choreography-visible");
                    return;
                }
                if (entry.isIntersecting) {
                    entry.target.dataset.enterDirection = motionState.direction > 0 ? "down" : "up";
                    entry.target.classList.add("is-choreography-visible");
                    choreographyObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -6% 0px", threshold: 0.02 });

        choreographyElements.forEach((element, elementIndex) => {
            element.style.transitionDelay = `${Math.min(elementIndex % 3, 2) * 55}ms`;
            choreographyObserver.observe(element);
            const elementBounds = element.getBoundingClientRect();
            if (elementBounds.top < window.innerHeight && elementBounds.bottom > 0) {
                element.dataset.enterDirection = "down";
                element.classList.add("is-choreography-visible");
            }
        });
    };

    const setNavigationBackgroundInert = (navigationIsOpen) => {
        [mainContent, portfolioFooter, routeProgress].forEach((element) => {
            if (!element) {
                return;
            }
            if ("inert" in element) {
                element.inert = navigationIsOpen;
            }
            if (navigationIsOpen) {
                element.setAttribute("aria-hidden", "true");
            } else {
                element.removeAttribute("aria-hidden");
            }
        });
    };

    const closeNavigation = (restoreFocus = false) => {
        if (!navigationToggle || !navigationPanel) {
            return;
        }
        const navigationWasOpen = navigationToggle.getAttribute("aria-expanded") === "true";
        window.clearTimeout(navigationFocusTimerId);
        navigationToggle.setAttribute("aria-expanded", "false");
        navigationToggle.setAttribute("aria-label", "Открыть меню");
        navigationPanel.classList.remove("is-open");
        documentBody.classList.remove("nav-open");
        setNavigationBackgroundInert(false);
        if (restoreFocus && navigationWasOpen) {
            (navigationPreviousFocus || navigationToggle).focus();
        }
    };

    const openNavigation = () => {
        if (!navigationToggle || !navigationPanel) {
            return;
        }
        navigationPreviousFocus = document.activeElement;
        navigationToggle.setAttribute("aria-expanded", "true");
        navigationToggle.setAttribute("aria-label", "Закрыть меню");
        navigationPanel.classList.add("is-open");
        documentBody.classList.add("nav-open");
        setNavigationBackgroundInert(true);
        window.clearTimeout(navigationFocusTimerId);
        navigationFocusTimerId = window.setTimeout(() => {
            navigationPanel.querySelector("a")?.focus();
        }, 260);
    };

    const toggleNavigation = () => {
        if (navigationToggle?.getAttribute("aria-expanded") === "true") {
            closeNavigation(true);
        } else {
            openNavigation();
        }
    };

    const trapNavigationFocus = (event) => {
        if (event.key !== "Tab" || navigationToggle?.getAttribute("aria-expanded") !== "true" || !navigationPanel) {
            return;
        }
        const focusableElements = [navigationToggle, ...navigationPanel.querySelectorAll("a, button")]
            .filter((element) => !element.disabled && element.offsetParent !== null);
        if (!focusableElements.length) {
            return;
        }
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    };

    const applyMotionPreference = () => {
        motionState.reduced = reducedMotionQuery.matches;
        documentBody.classList.remove("is-scroll-active", "is-section-activating");
        window.cancelAnimationFrame(motionState.frameId);
        window.cancelAnimationFrame(motionState.reducedFrameId);
        window.clearTimeout(motionState.frameTimerId);
        motionState.frameId = 0;
        motionState.reducedFrameId = 0;
        motionState.frameTimerId = 0;
        motionState.energy = 0;
        motionState.targetEnergy = 0;
        documentRoot.style.setProperty("--scroll-energy", "0");
        documentRoot.style.setProperty("--background-shift", "0px");
        lastRenderedEnergy = 0;
        lastRenderedShift = "0px";
        motionState.scrollDirty = true;
        resetPointerDepth();
        projectCards.forEach((projectCard) => projectCard.classList.remove("is-flow-active"));

        if (motionState.reduced) {
            documentRoot.classList.add("is-hero-ready");
            choreographyElements.forEach((element) => element.classList.add("is-choreography-visible"));
            dataField.drawStatic();
            motionState.scrollDirty = true;
            requestReducedFrame();
        } else {
            motionState.lastFrameTime = performance.now();
            startRuntime();
        }
    };

    const requestLayoutCache = () => {
        window.cancelAnimationFrame(layoutFrameId);
        layoutFrameId = window.requestAnimationFrame(() => {
            dataField.resize();
            cacheLayout();
            if (window.innerWidth > 820) {
                closeNavigation(false);
            }
            if (motionState.reduced) {
                dataField.drawStatic();
                requestReducedFrame();
            }
        });
    };

    heroTechnologyModules.forEach((module) => {
        module.addEventListener("click", () => activateHeroTechnology(module.dataset.heroTech));
    });
    architectureNodes.forEach((node) => {
        node.addEventListener("click", () => activateArchitectureNode(node.dataset.architectureNode));
    });
    profileNodes.forEach((node) => {
        node.addEventListener("click", () => activateProfileNode(node.dataset.profileNode));
    });
    technologyDomains.forEach((domain) => {
        const activateCurrentDomain = () => activateTechnologyDomain(domain.dataset.technologyDomain);
        domain.addEventListener("pointerenter", activateCurrentDomain);
    });
    technologyDomainControls.forEach((control) => {
        const activateCurrentDomain = () => activateTechnologyDomain(control.dataset.technologyDomainControl);
        control.addEventListener("focus", activateCurrentDomain);
        control.addEventListener("click", activateCurrentDomain);
    });

    navigationToggle?.addEventListener("click", toggleNavigation);
    navigationLinks.forEach((link) => link.addEventListener("click", () => closeNavigation(false)));
    routeLinks.forEach((link) => link.addEventListener("click", () => closeNavigation(false)));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNavigation(true);
            return;
        }
        trapNavigationFocus(event);
    });

    window.addEventListener("scroll", () => {
        motionState.lastScrollEventTime = performance.now();
        motionState.scrollDirty = true;
        if (motionState.reduced) {
            requestReducedFrame();
        } else {
            scheduleRuntimeFrame(true);
        }
    }, { passive: true });
    window.addEventListener("resize", requestLayoutCache, { passive: true });
    document.addEventListener("visibilitychange", () => {
        motionState.visible = !document.hidden;
        if (!motionState.visible) {
            window.cancelAnimationFrame(motionState.frameId);
            window.cancelAnimationFrame(motionState.reducedFrameId);
            window.clearTimeout(motionState.frameTimerId);
            motionState.frameId = 0;
            motionState.reducedFrameId = 0;
            motionState.frameTimerId = 0;
            documentBody.classList.remove("is-scroll-active");
            return;
        }
        motionState.lastFrameTime = performance.now();
        motionState.previousFrameScrollY = Math.max(window.scrollY, 0);
        if (motionState.reduced) {
            dataField.drawStatic();
            requestReducedFrame();
        } else {
            startRuntime();
        }
    });
    reducedMotionQuery.addEventListener("change", applyMotionPreference);
    finePointerQuery.addEventListener("change", () => {
        if (!finePointerQuery.matches) {
            resetPointerDepth();
        }
    });

    bindPointerDepth(architectureStage, "stage");
    projectCards.forEach((projectCard) => bindPointerDepth(projectCard, "card"));
    bindProjectFlows();
    observeChoreography();
    dataField.resize();
    cacheLayout();
    activateArchitectureNode("spring", false);
    activateProfileNode(profileMap?.dataset.activeProfile || "events");
    activateTechnologyDomain(technologyMap?.dataset.activeDomain || "spring");
    setActiveSection("top");

    document.querySelectorAll("[data-current-year]").forEach((yearElement) => {
        yearElement.textContent = String(new Date().getFullYear());
    });

    if (motionState.reduced) {
        documentRoot.classList.add("is-hero-ready");
        choreographyElements.forEach((element) => element.classList.add("is-choreography-visible"));
        dataField.drawStatic();
        requestReducedFrame();
    } else {
        window.requestAnimationFrame(() => {
            documentRoot.classList.add("is-hero-ready");
            window.setTimeout(() => playArchitectureFlow("request"), 720);
            window.setTimeout(() => playArchitectureFlow("event"), 840);
            window.setTimeout(() => playArchitectureFlow("data"), 960);
        });
        startRuntime();
    }
})();
