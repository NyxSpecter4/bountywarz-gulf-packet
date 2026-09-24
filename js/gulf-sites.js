/* gulf-sites.js — 12 theater twins. Classic. No export. Fail-open roster. */
(function (g) {
  'use strict';
  if (g.GULF_PINS && g.GULF_PINS.length) return;
  g.GULF_PINS = [
    { id: 'kharg', name: 'Kharg Crown Terminal', lat: 29.24, lon: 50.32, cve: 'CVE-2021-44228', faction: 'SILICA' },
    { id: 'bandar', name: 'Bandar Cracking Core', lat: 27.181, lon: 56.270, cve: 'CVE-2021-34527', faction: 'CHAOS' },
    { id: 'hormuz', name: 'Hormuz Static Wall', lat: 26.5667, lon: 56.25, cve: 'CVE-2019-19781', faction: 'NEUTRAL' },
    { id: 'muscat', name: 'Muscat Gate Tower', lat: 23.623, lon: 58.575, cve: 'CVE-2023-27350', faction: 'NEO' },
    { id: 'dubai', name: 'Jebel Ali Relay', lat: 25.011, lon: 55.061, cve: 'CVE-2020-1472', faction: 'SILICA' },
    { id: 'doha', name: 'Lusail Edge Rack', lat: 25.286, lon: 51.534, cve: 'CVE-2021-26084', faction: 'NEO' },
    { id: 'kuwait', name: 'Shuwaikh Pump Ring', lat: 29.35, lon: 47.94, cve: 'CVE-2023-34362', faction: 'SILICA' },
    { id: 'bushehr', name: 'Bushehr Veil Stack', lat: 28.968, lon: 50.838, cve: 'CVE-2018-13379', faction: 'CHAOS' },
    { id: 'fujairah', name: 'Fujairah Bunker Wall', lat: 25.128, lon: 56.334, cve: 'CVE-2021-1675', faction: 'NEUTRAL' },
    { id: 'ras-tanura', name: 'Ras Tanura Valve', lat: 26.641, lon: 50.159, cve: 'CVE-2014-0160', faction: 'SILICA' },
    { id: 'sirri', name: 'Sirri Ghost Coil', lat: 25.909, lon: 54.539, cve: 'CVE-2020-0796', faction: 'CHAOS' },
    { id: 'qeshm', name: 'Qeshm Struts Feeder', lat: 26.758, lon: 55.805, cve: 'CVE-2017-5638', faction: 'CHAOS' }
  ];
}(typeof window !== 'undefined' ? window : this));
