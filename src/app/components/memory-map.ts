import { afterNextRender, Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';

export interface MapPoint {
  lat: number;
  lng: number;
  city: string;
  names: string[];
}

/** Carte « Ils pensent à toi depuis… » : un point par ville. */
@Component({
  selector: 'app-memory-map',
  template: `<div #host class="h-80 w-full overflow-hidden rounded-2xl border border-white/10 sm:h-[28rem]"></div>`,
})
export class MemoryMap implements OnDestroy {
  readonly points = input.required<MapPoint[]>();
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private map?: LeafletMap;
  private layer?: LayerGroup;
  private L?: typeof import('leaflet');

  constructor() {
    afterNextRender(async () => {
      // Chargement paresseux : Leaflet n'alourdit pas l'accueil.
      const mod = await import('leaflet');
      const L = ((mod as unknown as { default?: typeof mod }).default ?? mod) as typeof import('leaflet');
      this.L = L;
      this.map = L.map(this.host().nativeElement, { scrollWheelZoom: false, worldCopyJump: true }).setView([10, 15], 2);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 12,
      }).addTo(this.map);
      this.layer = L.layerGroup().addTo(this.map);
      this.draw();
    });
    effect(() => {
      this.points();
      this.draw();
    });
  }

  private draw() {
    const L = this.L;
    if (!L || !this.map || !this.layer) return;
    this.layer.clearLayers();
    const pts = this.points();
    for (const p of pts) {
      const radius = 7 + Math.min(10, p.names.length * 2);
      L.circleMarker([p.lat, p.lng], {
        radius,
        color: '#87CEEB',
        weight: 2,
        fillColor: '#87CEEB',
        fillOpacity: 0.45,
      })
        .bindPopup(`<strong>${escapeHtml(p.city)}</strong><br>${p.names.map(escapeHtml).join(', ')}`)
        .addTo(this.layer);
    }
    if (pts.length > 1) {
      this.map.fitBounds(L.latLngBounds(pts.map((p) => [p.lat, p.lng] as [number, number])), { padding: [30, 30], maxZoom: 5 });
    } else if (pts.length === 1) {
      this.map.setView([pts[0]!.lat, pts[0]!.lng], 5);
    }
  }

  ngOnDestroy() {
    this.map?.remove();
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
