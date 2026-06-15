import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'

/**
 * Mapa REAL de Latinoamérica usando GeoJSON de Natural Earth (via
 * world-atlas + d3-geo). Filtra los 25 países latinoamericanos por
 * ISO id y los renderiza con proyección Mercator centrada en LATAM.
 * Encima de los países dibujamos los dots de origen (sobre lat/long
 * real) y arcos hacia el mundo.
 *
 * Lazy-loaded desde Home.tsx via React.lazy + IntersectionObserver
 * para no penalizar el LCP del landing — el mapa pesa ~265KB (lib +
 * topojson 105KB) y está debajo del fold.
 */
const LATAM_ISO_IDS = new Set([
  '484', // México
  '320', // Guatemala
  '084', // Belize
  '340', // Honduras
  '222', // El Salvador
  '558', // Nicaragua
  '188', // Costa Rica
  '591', // Panamá
  '192', // Cuba
  '214', // Rep. Dominicana
  '332', // Haití
  '388', // Jamaica
  '630', // Puerto Rico
  '170', // Colombia
  '862', // Venezuela
  '328', // Guyana
  '740', // Suriname
  '254', // French Guiana
  '218', // Ecuador
  '604', // Perú
  '068', // Bolivia
  '076', // Brasil
  '600', // Paraguay
  '858', // Uruguay
  '032', // Argentina
  '152', // Chile
])

export default function LatamWorldMap() {
  // Coords reales [lng, lat] de comunidades con certificaciones activas.
  const cities: Array<{ coords: [number, number]; label: string }> = [
    { coords: [-74, 5], label: 'Colombia' },
    { coords: [-78, -1], label: 'Ecuador' },
    { coords: [-77, -10], label: 'Perú' },
    { coords: [-53, -10], label: 'Brasil' },
    { coords: [-65, -17], label: 'Bolivia' },
    { coords: [-65, -33], label: 'Argentina' },
    { coords: [-99, 22], label: 'México' },
  ]

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[460px]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          // Centrado en el punto medio de LATAM (México -118 ↔ Brasil -34;
          // y México 23N ↔ Tierra del Fuego -54S) para que entren TODOS
          // los países sin recortar el oeste de México ni el Caribe.
          scale: 350,
          center: [-79, -9],
        }}
        width={600}
        height={820}
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="latam-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D2A958" stopOpacity="1" />
            <stop offset="100%" stopColor="#A8842F" stopOpacity="0.95" />
          </linearGradient>
          <radialGradient id="dot-halo">
            <stop offset="0%" stopColor="#D2A958" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D2A958" stopOpacity="0" />
          </radialGradient>
        </defs>

        <Geographies
          geography={`${import.meta.env.BASE_URL}countries-110m.json`}
        >
          {({ geographies }: { geographies: Array<{ id?: string; rsmKey: string }> }) =>
            geographies
              .filter((d) => (d.id ? LATAM_ISO_IDS.has(d.id) : false))
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="url(#latam-grad)"
                  stroke="#fff"
                  strokeWidth={0.6}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#E5C36C' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
          }
        </Geographies>

        {cities.map((c, i) => (
          <Marker key={c.label} coordinates={c.coords}>
            <circle r={12} fill="url(#dot-halo)">
              <animate
                attributeName="r"
                values="8;16;8"
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.4}s`}
              />
              <animate
                attributeName="opacity"
                values="0.7;0.15;0.7"
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.4}s`}
              />
            </circle>
            <circle r={4} fill="#fff" stroke="#A8842F" strokeWidth={1.8} />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  )
}
