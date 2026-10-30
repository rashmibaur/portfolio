// Sector Data mapping the content of images 1.3.1 to 1.3.6 and Figma frames
const SECTOR_DATA = {
    food: {
        tagLeft: "01 / Food Security Sector",
        tagRight: "ND-GAIN Index Ref: F-01",
        title: "Agricultural Yields & Food Security",
        hazard: "Projected crop losses, shifts in growing seasons, and severe drought shocks.",
        narrative: "Climate disruption directly threatens global calorie production through shifting rainfall patterns and severe heat stress. Communities with high food import dependency and limited agricultural technological capacity are most exposed to sudden supply shocks and price spikes.",
        quote: "“Two-thirds of human calorie intake relies on just three crops: <span class=\"font-bold\">rice, wheat, and maize</span> all heavily exposed to projected temperature spikes.”",
        image: "food_photo.png",
        cssCrop: false
    },
    water: {
        tagLeft: "02 / Water Sector",
        tagRight: "ND-GAIN Index Set: W-01",
        title: "Hydrological Stress & Freshwater Availability",
        hazard: "Extreme runoff variability, aquifer depletion, and prolonged droughts.",
        narrative: "Glacial retreat, shifting precipitation, and over-extraction deplete renewable surface and groundwater resources. Poor storage infrastructure and high transboundary dependency leave populations vulnerable to severe water crises.",
        quote: "“Countries with <span class=\"font-bold\">water withdrawal rates</span> and low <span class=\"font-bold\">dam storage capacity</span> experience the fastest escalation in acute water risk during multi-year droughts.”",
        image: "water_photo.png",
        cssCrop: false
    },
    health: {
        tagLeft: "03 / Health Sector",
        tagRight: "ND-GAIN Index Ref: H-01",
        title: "Thermal Stress & Vector-Borne Expansion",
        hazard: "Spreading disease vectors, lethal heatwaves, and waterborne pathogen spikes.",
        narrative: "Warming temperatures push vector-borne diseases like malaria and dengue into higher altitudes and latitudes. Overcrowded informal settlements lacking basic healthcare infrastructure experience the highest surge in climate-attributable mortality.",
        quote: "“Rising <span class=\"font-bold\">thermal stress</span> and expanded <span class=\"font-bold\">mosquito breeding windows</span> put millions of previously unexposed urban dwellers at risk of infectious disease outbreaks.”",
        image: "health_photo.png",
        cssCrop: false
    },
    ecosystems: {
        tagLeft: "04 / Ecosystems Sector",
        tagRight: "ND-GAIN Index Set: E-01",
        title: "Biodiversity Loss & Biome Shift",
        hazard: "Coral bleaching, coastal mangrove degradation, and biome shifts.",
        narrative: "Ecosystems provide essential coastal protection, carbon sequestration, and natural resources. Rapid temperature shifts disrupt species distribution, collapsing ecosystems that coastal and indigenous communities depend on for survival.",
        quote: "“<span class=\"font-bold\">Natural capital degradation</span> disproportionately affects populations relying directly on <span class=\"font-bold\">artisanal fisheries</span> and intact forestry for daily income.”",
        image: "ecosystems_photo.png",
        cssCrop: false
    },
    habitat: {
        tagLeft: "05 / Habitat Sector",
        tagRight: "ND-GAIN Index Ref: HA-01",
        title: "Urban Inundation & Heat Hazards",
        hazard: "Extreme urban heat islands, storm surges, and riverine flooding.",
        narrative: "Unplanned urban expansion into high-risk coastal and river basin areas concentrates human vulnerability. Infrastructure gaps in transportation and housing exacerbate disaster risks during extreme flood events.",
        quote: "“Highly concentrated urban areas with <span class=\"font-bold\">low road paving</span> and <span class=\"font-bold\">logistics infrastructure</span> face severe delays in emergency evacuations during climate events.”",
        image: "habitat_photo.png",
        cssCrop: false
    },
    infrastructure: {
        tagLeft: "06 / Infrastructure Sector",
        tagRight: "ND-GAIN Index Set: I-01",
        title: "Coastal Inundation & Grid Failure",
        hazard: "Sea-level rise, coastal erosion, and power generation disruptions.",
        narrative: "Energy and power networks face mounting risks from shifting water availability and extreme weather. Low-lying coastal infrastructure, transport corridors, and power plants remain vulnerable to sea-level rise and storm surges.",
        quote: "“A significant portion of <span class=\"font-bold\">critical infrastructure</span> in developing coastal nations sits below the 5-meter elevation mark, making <span class=\"font-bold\">sea-level rise</span> a severe threat to long-term economic stability.”",
        image: "infrastructure_photo.png",
        cssCrop: false
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sector Switcher Logic
    const cards = document.querySelectorAll('.sector-card');
    
    const tagLeft = document.getElementById('sector-tag-left');
    const tagRight = document.getElementById('sector-tag-right');
    const title = document.getElementById('sector-title');
    const hazardContent = document.getElementById('hazard-content');
    const narrativeContent = document.getElementById('narrative-content');
    const quoteContent = document.getElementById('quote-content');
    const detailsWrapper = document.querySelector('.sector-details-wrapper');

    function switchSector(sectorId) {
        const data = SECTOR_DATA[sectorId];
        if (!data) return;
        
        detailsWrapper.style.opacity = '0';
        
        setTimeout(() => {
            tagLeft.innerText = data.tagLeft;
            tagRight.innerText = data.tagRight;
            title.innerText = data.title;
            hazardContent.innerText = data.hazard;
            narrativeContent.innerText = data.narrative;
            quoteContent.innerHTML = data.quote;            
            detailsWrapper.style.opacity = '1';
        }, 150);
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const sectorId = card.getAttribute('data-sector');
            switchSector(sectorId);
        });
    });

    // Initialize switcher
    switchSector('food');

    // 2. Trend Line Chart Logic (copied from 1.4.html)
    initTrendChart();
});

// ECharts line race script from 1.4.html
function initTrendChart() {
    // Data Extracted from vulnerability weighted.csv (population-weighted averages)
    const years = Array.from({length: 30}, (_, idx) => 1995 + idx); // 1995 to 2024
    
    const sectorData = {
        ecosystem: [0.568733,0.565774,0.56336,0.561298,0.559012,0.556447,0.550608,0.543989,0.538561,0.532555,0.526779,0.525864,0.524615,0.523785,0.523101,0.522516,0.521949,0.521772,0.521698,0.521627,0.521101,0.520494,0.519604,0.518502,0.51829,0.518304,0.518558,0.51781,0.518261,0.518555],
        habitat: [0.48856,0.488991,0.487548,0.486874,0.489532,0.488074,0.48687,0.485823,0.50152,0.499469,0.500818,0.499079,0.496909,0.493692,0.489676,0.4869,0.485388,0.484509,0.484789,0.485096,0.484005,0.482847,0.485921,0.489013,0.488606,0.487937,0.487189,0.486158,0.486318,0.486345],
        food: [0.516693,0.513942,0.510585,0.508002,0.504382,0.498593,0.499029,0.498439,0.498082,0.495359,0.492163,0.489392,0.488662,0.486299,0.485836,0.481762,0.480861,0.477212,0.474195,0.472828,0.479107,0.47708,0.472837,0.468495,0.468831,0.472744,0.471987,0.47096,0.470901,0.470224],
        water: [0.48064,0.481086,0.481625,0.481899,0.482233,0.482659,0.482617,0.482136,0.482389,0.481369,0.480723,0.480023,0.479482,0.479331,0.47879,0.478572,0.477747,0.476989,0.475698,0.475177,0.474493,0.474247,0.473771,0.473277,0.472912,0.472146,0.471474,0.470952,0.470418,0.469736],
        health: [0.514575,0.513858,0.513759,0.513582,0.513635,0.513257,0.512162,0.511789,0.509456,0.509708,0.506308,0.504883,0.501622,0.499581,0.496355,0.492437,0.490467,0.485806,0.482209,0.479388,0.473286,0.46968,0.465288,0.461965,0.459506,0.457047,0.457713,0.45617,0.454788,0.453644],
        infrastructure: [0.273052,0.272563,0.272109,0.271135,0.269711,0.270112,0.268358,0.267515,0.266021,0.267413,0.266462,0.265658,0.264752,0.264008,0.263551,0.262703,0.261317,0.261559,0.26058,0.26068,0.258716,0.250255,0.240012,0.23012,0.22148,0.218119,0.215683,0.216169,0.214727,0.214683]
    };

    // Helper to construct a URL encoded SVG circle badge for ECharts label images.
    function makeDataUri(pathD, isMultiPath = false) {
        const pathContent = isMultiPath ? pathD : `<path d="${pathD}" />`;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%236589AF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10.5" fill="%23EDEBE2" stroke="%236589AF" stroke-width="1.5"/><g transform="translate(4.8, 4.8) scale(0.6)">${pathContent}</g></svg>`;
        return 'data:image/svg+xml;utf8,' + svg;
    }

    // SVG path definitions for each sector matching index.html
    const icons = {
        food: makeDataUri('M12 2v20M12 6c1.5-1.5 3-1.5 3 0s-1.5 3-3 3M12 10c1.5-1.5 3-1.5 3 0s-1.5 3-3 3M12 14c1.5-1.5 3-1.5 3 0s-1.5 3-3 3M12 6c-1.5-1.5-3-1.5-3 0s1.5 3 3 3M12 10c-1.5-1.5-3-1.5-3 0s1.5 3 3 3M12 14c-1.5-1.5-3-1.5-3 0s1.5 3 3 3'),
        water: makeDataUri('M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'),
        health: makeDataUri('M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'),
        ecosystem: makeDataUri('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z"/><path d="M9 22v-6"/>', true),
        habitat: makeDataUri('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', true),
        infrastructure: makeDataUri('<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M8 6h2v2H8V6Zm0 4h2v2H8V10Zm6-4h2v2h-2V6Zm0 4h2v2h-2V10Z"/>', true)
    };

    const chartDom = document.getElementById('chart-canvas');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    let playInterval = null;
    let activeYearIdx = 29; // Starts at 2024

    // Function to build series options up to the currently active index
    function getSeriesConfig(maxIdx) {
        const sectors = Object.keys(sectorData);
        const SECTOR_COLORS = { ecosystem: '#7C78D6', habitat: '#A8432A', food: '#E0A030', water: '#3730A3', health: '#D1603D', infrastructure: '#1E1B4B' };
        return sectors.map(sec => {
            const c = SECTOR_COLORS[sec] || '#3730A3';
            const sliced = sectorData[sec].slice(0, maxIdx + 1);
            
            return {
                name: sec,
                type: 'line',
                data: sliced,
                smooth: true,
                showSymbol: false,
                lineStyle: {
                    width: 3.5,
                    color: c,
                    shadowColor: c + '40',
                    shadowBlur: 8,
                    shadowOffsetY: 4
                },
                labelLayout: {
                    moveOverlap: 'shiftY'
                },
                emphasis: {
                    focus: 'series',
                    lineStyle: {
                        width: 5,
                        color: c,
                        shadowBlur: 12
                    },
                    endLabel: {
                        rich: {
                            name: { color: c, fontWeight: 'bold' },
                            val: { color: c, fontSize: 15 }
                        }
                    }
                },
                endLabel: {
                    show: true,
                    offset: [10, 0],
                    formatter: function (params) {
                        return `{icon| }  {name|${params.seriesName}}  {val|${params.value.toFixed(2)}}`;
                    },
                    rich: {
                        icon: {
                            backgroundColor: {
                                image: icons[sec]
                            },
                            height: 24,
                            width: 24,
                            align: 'middle'
                        },
                        name: {
                            fontFamily: 'DM Sans',
                            fontWeight: 600,
                            fontSize: 13,
                            color: c
                        },
                        val: {
                            fontFamily: 'DM Sans',
                            fontWeight: 700,
                            fontSize: 13,
                            color: c
                        }
                    }
                }
            };
        });
    }

    // Main function to update chart state
    function updateChart(yearIdx, animate = true) {
        const currentYear = years[yearIdx];
        
        const option = {
            backgroundColor: 'transparent',
            animationDuration: animate ? 400 : 0,
            animationDurationUpdate: animate ? 400 : 0,
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(252,250,245,0.97)',
                borderColor: 'rgba(54, 52, 52, 0.16)',
                borderWidth: 1,
                textStyle: {
                    color: '#1E1B4B',
                    fontFamily: 'DM Sans',
                    fontSize: 13
                },
                formatter: function(params) {
                    let res = `<div style="font-weight:700;margin-bottom:6px;font-family:DM Sans;">Year: ${params[0].axisValue}</div>`;
                    params.sort((a, b) => b.value - a.value);
                    params.forEach(p => {
                        res += `<div style="display:flex;align-items:center;justify-content:space-between;gap:20px;font-size:12px;">
                                    <span>${p.seriesName}:</span>
                                    <span style="font-weight:700;">${p.value.toFixed(4)}</span>
                                </div>`;
                    });
                    return res;
                }
            },
            grid: {
                top: 60,
                bottom: 24,
                left: 48,
                right: 175,
                containLabel: false
            },
            xAxis: {
                type: 'category',
                position: 'top',
                data: years,
                axisLabel: {
                    rotate: 90,
                    fontFamily: 'DM Sans',
                    fontWeight: 500,
                    color: '#1E1B4B',
                    fontSize: 11
                },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 0.6,
                interval: 0.2,
                axisLabel: {
                    fontFamily: 'DM Sans',
                    fontWeight: 500,
                    color: '#1E1B4B',
                    fontSize: 11
                },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: 'rgba(54, 52, 52, 0.08)',
                        type: 'dashed'
                    }
                }
            },
            series: getSeriesConfig(yearIdx),
            graphic: [
                {
                    type: 'text',
                    left: 'center',
                    top: 'middle',
                    style: {
                        text: currentYear.toString(),
                        fontFamily: 'DM Sans',
                        fontSize: 180,
                        fontWeight: 800,
                        fill: 'rgba(54, 52, 52, 0.045)',
                        zIndex: -1
                    }
                }
            ]
        };

        myChart.setOption(option);
        
        // Sync scrubber UI
        document.getElementById('year-slider').value = currentYear;
        document.getElementById('year-label').innerText = currentYear;
    }

    // Playback Controller Logic
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const yearSlider = document.getElementById('year-slider');

    function startPlayback() {
        if (activeYearIdx >= 29) {
            activeYearIdx = 0;
            updateChart(activeYearIdx, false);
        }
        
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        playPauseBtn.title = 'Pause Animation';
        
        playInterval = setInterval(() => {
            activeYearIdx++;
            if (activeYearIdx >= 30) {
                stopPlayback();
                activeYearIdx = 29;
            } else {
                updateChart(activeYearIdx, true);
            }
        }, 500);
    }

    function stopPlayback() {
        clearInterval(playInterval);
        playInterval = null;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        playPauseBtn.title = 'Play Animation';
    }

    playPauseBtn.addEventListener('click', () => {
        if (playInterval) {
            stopPlayback();
        } else {
            startPlayback();
        }
    });

    yearSlider.addEventListener('input', (e) => {
        stopPlayback();
        const yearVal = parseInt(e.target.value);
        activeYearIdx = yearVal - 1995;
        updateChart(activeYearIdx, true);
    });

    // Initialize chart at 2024
    updateChart(2024 - 1995, false);

    // Handle resize events
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}
