
// Subcategorías académicas (se almacenan tal cual en sector_actor)
export const ACADEMICO_SUBSECTORES = [
  'Académico — Universidad / Centro de Formación para el trabajo',
  'Académico — Institución Educativa',
  'Académico — Academia (Otros)',
] as const;

// Sectores no académicos
export const SECTORES_BASE = [
  'Público',
  'Privado',
  'Gremio empresarial',
  'Organismos internacionales',
  'Fundaciones y corporaciones de la sociedad civil',
  'Medio de comunicación',
  'Mixto',
  'Redes y plataformas multiactor',
  'Religioso',
] as const;

// Lista maestra completa (única fuente de verdad para validaciones, filtros y reportes)
export const SECTOR_OPTIONS = [
  ...SECTORES_BASE,
  ...ACADEMICO_SUBSECTORES,
] as const;

export const ALCANCE_TERRITORIAL_OPTIONS = [
  'Municipal',
  'Departamental',
  'Regional', 
  'Nacional',
  'Internacional'
] as const;

export const PROYECTOS_OPTIONS = [
  'Aprende',
  'Bilinguismo',
  'Coding Hubs',
  'EA. Ecosistema de Primera Infancia',
  'Jóvenes Rurales',
  'La U en tu Colegio',
  'Manizales Campus',
  'Manizales Cómo Vamos',
  'Manizales Más',
  'Proyectos Especial',
  'Sueño de Chocolate',
  'Tercera Edad'
] as const;

export const TIPO_RELACION_OPTIONS = [
  'Donante',
  'Beneficiario',
  'Co-Implementador',
  'Co-gestor',
  'Prospecto',
  'Membresía'
] as const;

export const NIVEL_OPTIONS = [1, 2, 3, 4, 5] as const;

export const NIVEL_INTERES_OPCIONES = [
  { value: 1, title: "1. Muy bajo", description: "Contribución marginal al cumplimiento de objetivos." },
  { value: 2, title: "2. Bajo", description: "Puede ser relevante en situaciones específicas, pero no es estratégico." },
  { value: 3, title: "3. Medio", description: "Relación útil y alineada en algunos frentes." },
  { value: 4, title: "4. Alto", description: "Existe alineación clara y oportunidades de trabajo conjunto." },
  { value: 5, title: "5. Muy alto", description: "Su vinculación es crítica para el logro de resultados y la sostenibilidad de la estrategia." },
];

export const NIVEL_INFLUENCIA_PODER_OPCIONES = [
  { value: 1, title: "1. Nulo", description: "No moviliza recursos ni actores relevantes." },
  { value: 2, title: "2. Bajo", description: "Influencia limitada a su ámbito interno o a proyectos específicos." },
  { value: 3, title: "3. Medio", description: "Puede movilizar recursos o alianzas de manera puntual." },
  { value: 4, title: "4. Alto", description: "Influye de manera consistente en decisiones, actores o agendas. Moviliza recursos, posiciona temas y conecta actores relevantes." },
  { value: 5, title: "5. Muy alto", description: "Define agendas, moviliza múltiples actores y recursos, y tiene capacidad de transformar decisiones a nivel sistémico." },
];
export const ESTADO_RELACION_OPTIONS = [
  'Activa',
  'Potencial', 
  'Dormida'
] as const;

export const MUNICIPIOS_POR_DEPARTAMENTO = {
  'Caldas': [
    'Aguadas', 'Anserma', 'Aranzazu', 'Belalcázar', 'Chinchiná', 'Filadelfia', 
    'La Dorada', 'La Merced', 'Manizales', 'Manzanares', 'Marmato', 'Marquetalia', 
    'Marulanda', 'Neira', 'Norcasia', 'Pácora', 'Palestina', 'Pensilvania', 
    'Riosucio', 'Risaralda', 'Salamina', 'Samaná', 'San José', 'Supía', 
    'Victoria', 'Villamaría', 'Viterbo'
  ],
  'Antioquia': [
    'Abejorral', 'Abriaquí', 'Alejandría', 'Amagá', 'Amalfi', 'Andes', 'Angelópolis',
    'Angostura', 'Anorí', 'Anza', 'Apartadó', 'Arboletes', 'Argelia', 'Armenia',
    'Barbosa', 'Bello', 'Belmira', 'Betania', 'Betulia', 'Briceño', 'Buriticá',
    'Cáceres', 'Caicedo', 'Caldas', 'Campamento', 'Cañasgordas', 'Caracolí',
    'Caramanta', 'Carepa', 'Carmen de Viboral', 'Carolina', 'Caucasia', 'Chigorodó',
    'Cisneros', 'Cocorná', 'Concepción', 'Concordia', 'Copacabana', 'Dabeiba',
    'Don Matías', 'Ebéjico', 'El Bagre', 'El Peñón', 'El Retiro', 'El Santuario',
    'Entrerríos', 'Envigado', 'Fredonia', 'Frontino', 'Giraldo', 'Girardota',
    'Granada', 'Guadalupe', 'Guarne', 'Guatapé', 'Heliconia', 'Hispania',
    'Itagüí', 'Ituango', 'Jardín', 'Jericó', 'La Ceja', 'La Estrella', 'La Pintada',
    'La Unión', 'Liborina', 'Maceo', 'Marinilla', 'Medellín', 'Montebello',
    'Murindó', 'Mutatá', 'Nariño', 'Nechí', 'Necoclí', 'Olaya', 'Peque',
    'Pueblorrico', 'Puerto Berrío', 'Puerto Nare', 'Puerto Triunfo', 'Remedios',
    'Rionegro', 'Sabanalarga', 'Sabaneta', 'Salgar', 'San Andrés de Cuerquia',
    'San Carlos', 'San Francisco', 'San Jerónimo', 'San José de la Montaña',
    'San Juan de Urabá', 'San Luis', 'San Pedro', 'San Pedro de Urabá',
    'San Rafael', 'San Roque', 'San Vicente', 'Santa Bárbara', 'Santa Rosa de Osos',
    'Santo Domingo', 'Segovia', 'Sonsón', 'Sopetrán', 'Támesis', 'Tarazá',
    'Tarso', 'Titiribí', 'Toledo', 'Turbo', 'Uramita', 'Urrao', 'Valdivia',
    'Valparaíso', 'Vegachí', 'Venecia', 'Vigía del Fuerte', 'Yalí', 'Yarumal',
    'Yolombó', 'Yondó', 'Zaragoza'
  ],
  'Cundinamarca': [
    'Agua de Dios', 'Albán', 'Anapoima', 'Anolaima', 'Apulo', 'Arbeláez', 'Beltrán',
    'Bituima', 'Bogotá', 'Bojacá', 'Cabrera', 'Cachipay', 'Cajicá', 'Caparrapí',
    'Cáqueza', 'Carmen de Carupa', 'Chaguaní', 'Chía', 'Chipaque', 'Choachí',
    'Chocontá', 'Cogua', 'Cota', 'Cucunubá', 'El Colegio', 'El Peñón', 'El Rosal',
    'Facatativá', 'Fómeque', 'Fosca', 'Funza', 'Fúquene', 'Fusagasugá', 'Gachalá',
    'Gachancipá', 'Gachetá', 'Gama', 'Girardot', 'Granada', 'Guachetá', 'Guaduas',
    'Guasca', 'Guataquí', 'Guatavita', 'Guayabal de Siquima', 'Guayabetal',
    'Gutiérrez', 'Jerusalén', 'Junín', 'La Calera', 'La Mesa', 'La Palma',
    'La Peña', 'La Vega', 'Lenguazaque', 'Machetá', 'Madrid', 'Manta', 'Medina',
    'Mosquera', 'Nariño', 'Nemocón', 'Nilo', 'Nimaima', 'Nocaima', 'Pacho',
    'Paime', 'Pandi', 'Paratebueno', 'Pasca', 'Puerto Salgar', 'Pulí', 'Quebradanegra',
    'Quetame', 'Quipile', 'Ricaurte', 'San Antonio del Tequendama', 'San Bernardo',
    'San Cayetano', 'San Francisco', 'San Juan de Río Seco', 'Sasaima', 'Sesquilé',
    'Sibaté', 'Silvania', 'Simijaca', 'Soacha', 'Sopó', 'Subachoque', 'Suesca',
    'Supatá', 'Susa', 'Sutatausa', 'Tabio', 'Tausa', 'Tena', 'Tenjo', 'Tibacuy',
    'Tibirita', 'Tocaima', 'Tocancipá', 'Topaipí', 'Ubalá', 'Ubaque', 'Ubaté',
    'Une', 'Útica', 'Venecia', 'Vergaña', 'Vianí', 'Villa de San Diego de Ubaté',
    'Villagómez', 'Villapinzón', 'Villeta', 'Viotá', 'Yacopí', 'Zipacón', 'Zipaquirá'
  ],
  'Valle del Cauca': [
    'Alcalá', 'Andalucía', 'Ansermanuevo', 'Argelia', 'Bolívar', 'Buenaventura',
    'Buga', 'Bugalagrande', 'Caicedonia', 'Cali', 'Calima', 'Candelaria',
    'Cartago', 'Dagua', 'El Águila', 'El Cairo', 'El Cerrito', 'El Dovio',
    'Florida', 'Ginebra', 'Guacarí', 'Guadalajara de Buga', 'Jamundí', 'La Cumbre',
    'La Unión', 'La Victoria', 'Obando', 'Palmira', 'Pradera', 'Restrepo',
    'Riofrío', 'Roldanillo', 'San Pedro', 'Sevilla', 'Toro', 'Trujillo',
    'Tuluá', 'Ulloa', 'Versalles', 'Vijes', 'Yotoco', 'Yumbo', 'Zarzal'
  ],
  'Atlántico': [
    'Barranquilla', 'Baranoa', 'Campo de la Cruz', 'Candelaria', 'Galapa',
    'Juan de Acosta', 'Luruaco', 'Malambo', 'Manatí', 'Palmar de Varela',
    'Piojó', 'Polonuevo', 'Ponedera', 'Puerto Colombia', 'Repelón',
    'Sabanagrande', 'Sabanalarga', 'Santa Lucía', 'Santo Tomás', 'Soledad',
    'Suan', 'Tubará', 'Usiacurí'
  ],
  'Bolívar': [
    'Achí', 'Altos del Rosario', 'Arenal', 'Arjona', 'Arroyohondo', 'Barranco de Loba',
    'Cartagena', 'Cicuco', 'Clemencia', 'Córdoba', 'El Carmen de Bolívar',
    'El Guamo', 'El Peñón', 'Hatillo de Loba', 'Magangué', 'Mahates', 'Margarita',
    'María la Baja', 'Montecristo', 'Mompós', 'Morales', 'Norosí', 'Pinillos',
    'Regidor', 'Río Viejo', 'San Cristóbal', 'San Estanislao', 'San Fernando',
    'San Jacinto', 'San Jacinto del Cauca', 'San Juan Nepomuceno', 'San Martín de Loba',
    'San Pablo', 'Santa Catalina', 'Santa Rosa', 'Santa Rosa del Sur', 'Simití',
    'Soplaviento', 'Talaigua Nuevo', 'Tiquisio', 'Turbaco', 'Turbaná', 'Villanueva',
    'Zambrano'
  ],
  'Santander': [
    'Aguada', 'Albania', 'Aratoca', 'Barbosa', 'Barichara', 'Barrancas', 'Betulia',
    'Bolívar', 'Bucaramanga', 'Cabrera', 'California', 'Capitanejo', 'Carcasí',
    'Cepitá', 'Cerrito', 'Charalá', 'Charta', 'Chima', 'Chipatá', 'Cimitarra',
    'Concepción', 'Confines', 'Contratación', 'Coromoro', 'Curití', 'El Carmen',
    'El Guacamayo', 'El Peñón', 'El Playón', 'Encino', 'Enciso', 'Florián',
    'Floridablanca', 'Galán', 'Gambita', 'Girón', 'Guaca', 'Guadalupe', 'Guapotá',
    'Guavatá', 'Güepsa', 'Hato', 'Jesús María', 'Jordán', 'La Belleza', 'La Paz',
    'Landázuri', 'Lebríja', 'Los Santos', 'Macaravita', 'Málaga', 'Matanza',
    'Mogotes', 'Molagavita', 'Ocamonte', 'Oiba', 'Onzaga', 'Palmar', 'Palmas del Socorro',
    'Páramo', 'Piedecuesta', 'Pinchote', 'Puente Nacional', 'Puerto Parra',
    'Puerto Wilches', 'Rionegro', 'Sabana de Torres', 'San Andrés', 'San Benito',
    'San Gil', 'San Joaquín', 'San José de Miranda', 'San Miguel', 'San Vicente de Chucurí',
    'Santa Bárbara', 'Santa Helena del Opón', 'Simacota', 'Socorro', 'Suaita',
    'Sucre', 'Suratá', 'Tona', 'Valle de San José', 'Vélez', 'Vetas', 'Villanueva',
    'Zapatoca'
  ],
  'Huila': [
    'Acevedo', 'Agrado', 'Aipe', 'Algeciras', 'Altamira', 'Baraya', 'Campoalegre',
    'Colombia', 'Elías', 'Garzón', 'Gigante', 'Guadalupe', 'Hobo', 'Íquira',
    'Isnos', 'La Argentina', 'La Plata', 'Nátaga', 'Neiva', 'Oporapa', 'Paicol',
    'Palermo', 'Palestina', 'Pital', 'Pitalito', 'Rivera', 'Saladoblanco',
    'San Agustín', 'Santa María', 'Suaza', 'Tarqui', 'Tesalia', 'Tello',
    'Teruel', 'Timaná', 'Villavieja', 'Yaguará'
  ],
  'Risaralda': [
    'Apía', 'Balboa', 'Belén de Umbría', 'Dosquebradas', 'Guática', 'La Celia',
    'La Virginia', 'Marsella', 'Mistrató', 'Pereira', 'Pueblo Rico', 'Quinchía',
    'Santa Rosa de Cabal', 'Santuario'
  ],
  'Quindío': [
    'Armenia', 'Buenavista', 'Calarcá', 'Circasia', 'Córdoba', 'Filandia',
    'Génova', 'La Tebaida', 'Montenegro', 'Pijao', 'Quimbaya', 'Salento'
  ],
  'Tolima': [
    'Alpujarra', 'Alvarado', 'Ambalema', 'Anzoátegui', 'Armero', 'Ataco',
    'Cajamarca', 'Carmen de Apicalá', 'Casabianca', 'Chaparral', 'Coello',
    'Coyaima', 'Cunday', 'Dolores', 'Espinal', 'Falan', 'Flandes', 'Fresno',
    'Guamo', 'Herveo', 'Honda', 'Ibagué', 'Icononzo', 'Lérida', 'Líbano',
    'Mariquita', 'Melgar', 'Murillo', 'Natagaima', 'Ortega', 'Palocabildo',
    'Piedras', 'Planadas', 'Prado', 'Purificación', 'Rioblanco', 'Roncesvalles',
    'Rovira', 'Saldaña', 'San Antonio', 'San Luis', 'Santa Isabel', 'Suárez',
    'Valle de San Juan', 'Venadillo', 'Villahermosa', 'Villarrica'
  ],
  'Nariño': [
    'Albán', 'Aldana', 'Ancuyá', 'Arboleda', 'Barbacoas', 'Belén', 'Buesaco',
    'Chachagüí', 'Colón', 'Consacá', 'Contadero', 'Córdoba', 'Cuaspud',
    'Cumbal', 'Cumbitara', 'El Charco', 'El Peñol', 'El Rosario', 'El Tablón de Gómez',
    'El Tambo', 'Funes', 'Guachucal', 'Guaitarilla', 'Gualmatán', 'Iles',
    'Imués', 'Ipiales', 'La Cruz', 'La Florida', 'La Llanada', 'La Tola',
    'La Unión', 'Leiva', 'Linares', 'Los Andes', 'Magüí', 'Mallama',
    'Mosquera', 'Nariño', 'Olaya Herrera', 'Ospina', 'Francisco Pizarro',
    'Policarpa', 'Potosí', 'Providencia', 'Puerres', 'Pupiales', 'Ricaurte',
    'Roberto Payán', 'Samaniego', 'Sandoná', 'San Bernardo', 'San Lorenzo',
    'San Pablo', 'San Pedro de Cartago', 'Santa Bárbara', 'Santacruz',
    'Sapuyes', 'Taminango', 'Tangua', 'Tumaco', 'Túquerres', 'Yacuanquer'
  ],
  'Meta': [
    'Acacías', 'Barranca de Upía', 'Cabuyaro', 'Castilla la Nueva', 'Cubarral',
    'Cumaral', 'El Calvario', 'El Castillo', 'El Dorado', 'Fuente de Oro',
    'Granada', 'Guamal', 'Lejanías', 'Mapiripán', 'Mesetas', 'La Macarena',
    'Puerto Concordia', 'Puerto Gaitán', 'Puerto Lleras', 'Puerto López',
    'Puerto Rico', 'Restrepo', 'San Carlos de Guaroa', 'San Juan de Arama',
    'San Juanito', 'San Martín', 'Uribe', 'Villavicencio', 'Vista Hermosa'
  ],
  'Norte de Santander': [
    'Ábrego', 'Arboledas', 'Bochalema', 'Bucarasica', 'Cáchira', 'Cácota',
    'Chinácota', 'Chitagá', 'Convención', 'Cúcuta', 'Cucutilla', 'Durania',
    'El Carmen', 'El Tarra', 'El Zulia', 'Gramalote', 'Hacarí', 'Herrán',
    'Labateca', 'La Esperanza', 'La Playa', 'Los Patios', 'Lourdes', 'Mutiscua',
    'Ocaña', 'Pamplona', 'Pamplonita', 'Puerto Santander', 'Ragonvalia',
    'Salazar', 'San Calixto', 'San Cayetano', 'Santiago', 'Sardinata',
    'Silos', 'Teorama', 'Tibú', 'Toledo', 'Villa Caro', 'Villa del Rosario'
  ],
  'Córdoba': [
    'Ayapel', 'Buenavista', 'Canalete', 'Cereté', 'Chimá', 'Chinú', 'Ciénaga de Oro',
    'Cotorra', 'La Apartada', 'Lorica', 'Los Córdobas', 'Momil', 'Montelíbano',
    'Montería', 'Moñitos', 'Planeta Rica', 'Pueblo Nuevo', 'Puerto Escondido',
    'Puerto Libertador', 'Purísima', 'Sahagún', 'San Andrés Sotavento',
    'San Antero', 'San Bernardo del Viento', 'San Carlos', 'San Pelayo',
    'Tierralta', 'Tuchín', 'Valencia'
  ],
  'Magdalena': [
    'Algarrobo', 'Aracataca', 'Ariguaní', 'Cerro San Antonio', 'Chibolo',
    'Ciénaga', 'Concordia', 'El Banco', 'El Piñón', 'El Retén', 'Fundación',
    'Guamal', 'Nueva Granada', 'Pedraza', 'Pijiño del Carmen', 'Pivijay',
    'Plato', 'Puebloviejo', 'Remolino', 'Sabanas de San Ángel', 'Salamina',
    'San Sebastián de Buenavista', 'San Zenón', 'Santa Ana', 'Santa Bárbara de Pinto',
    'Santa Marta', 'Sitionuevo', 'Tenerife', 'Zapayán', 'Zona Bananera'
  ],
  'Sucre': [
    'Buenavista', 'Caimito', 'Chalán', 'Coloso', 'Corozal', 'Coveñas',
    'El Roble', 'Galeras', 'Guaranda', 'La Unión', 'Los Palmitos',
    'Majagual', 'Morroa', 'Ovejas', 'Palmito', 'Sampués', 'San Benito Abad',
    'San Juan de Betulia', 'San Marcos', 'San Onofre', 'San Pedro',
    'Santiago de Tolú', 'Sincelejo', 'Sucre', 'Tolú Viejo'
  ],
  'Cesar': [
    'Aguachica', 'Agustín Codazzi', 'Astrea', 'Becerril', 'Bosconia',
    'Chimichagua', 'Chiriguaná', 'Curumaní', 'El Copey', 'El Paso',
    'Gamarra', 'González', 'La Gloria', 'La Jagua de Ibirico', 'La Paz',
    'Manaure', 'Pailitas', 'Pelaya', 'Pueblo Bello', 'Río de Oro',
    'San Alberto', 'San Diego', 'San Martín', 'Tamalameque', 'Valledupar'
  ],
  'La Guajira': [
    'Albania', 'Barrancas', 'Dibulla', 'Distracción', 'El Molino', 'Fonseca',
    'Hatonuevo', 'La Jagua del Pilar', 'Maicao', 'Manaure', 'Riohacha',
    'San Juan del Cesar', 'Uribia', 'Urumita', 'Villanueva'
  ],
  'Chocó': [
    'Acandí', 'Alto Baudó', 'Atrato', 'Bagadó', 'Bahía Solano', 'Bajo Baudó',
    'Bojayá', 'Cantón de San Pablo', 'Cértegui', 'Condoto', 'El Carmen de Atrato',
    'El Litoral del San Juan', 'Istmina', 'Juradó', 'Lloró', 'Medio Atrato',
    'Medio Baudó', 'Medio San Juan', 'Nóvita', 'Nuquí', 'Quibdó', 'Río Iró',
    'Río Quito', 'Riosucio', 'San José del Palmar', 'Sipí', 'Tadó', 'Unguía',
    'Unión Panamericana'
  ],
  'Cauca': [
    'Almaguer', 'Argelia', 'Balboa', 'Bolívar', 'Buenos Aires', 'Cajibío',
    'Caldono', 'Caloto', 'Corinto', 'El Tambo', 'Florencia', 'Guachené',
    'Guapí', 'Inzá', 'Jambaló', 'La Sierra', 'La Vega', 'López de Micay',
    'Mercaderes', 'Miranda', 'Morales', 'Padilla', 'Páez', 'Patía',
    'Piamonte', 'Piendamó', 'Popayán', 'Puerto Tejada', 'Puracé',
    'Rosas', 'San Sebastián', 'Santander de Quilichao', 'Santa Rosa',
    'Silvia', 'Sotará', 'Suárez', 'Sucre', 'Timbío', 'Timbiquí',
    'Toribío', 'Totoró', 'Villa Rica'
  ],
  'Boyacá': [
    'Almeida', 'Aquitania', 'Arcabuco', 'Belén', 'Berbeo', 'Betéitiva',
    'Boavita', 'Boyacá', 'Briceño', 'Buenavista', 'Busbanzá', 'Caldas',
    'Campohermoso', 'Cerinza', 'Chinavita', 'Chiquinquirá', 'Chíquiza',
    'Chiscas', 'Chita', 'Chitaraque', 'Chivatá', 'Chivor', 'Ciénega',
    'Cómbita', 'Coper', 'Corrales', 'Covarachía', 'Cubará', 'Cucaita',
    'Cuítiva', 'Duitama', 'El Cocuy', 'El Espino', 'Firavitoba', 'Floresta',
    'Gachantivá', 'Gámeza', 'Garagoa', 'Guacamayas', 'Guateque', 'Guayatá',
    'Güicán', 'Iza', 'Jenesano', 'Jericó', 'Labranzagrande', 'La Capilla',
    'La Uvita', 'La Victoria', 'Macanal', 'Maripí', 'Miraflores', 'Mongua',
    'Monguí', 'Moniquirá', 'Motavita', 'Muzo', 'Nobsa', 'Nuevo Colón',
    'Oicatá', 'Otanche', 'Pachavita', 'Páez', 'Paipa', 'Pajarito',
    'Panqueba', 'Pauna', 'Paya', 'Paz de Río', 'Pesca', 'Pisba',
    'Puerto Boyacá', 'Quípama', 'Ramiriquí', 'Ráquira', 'Rondón',
    'Saboyá', 'Sáchica', 'Samacá', 'San Eduardo', 'San José de Pare',
    'San Luis de Gaceno', 'San Mateo', 'San Miguel de Sema', 'San Pablo de Borbur',
    'Santa María', 'Santa Rosa de Viterbo', 'Santa Sofía', 'Sativanorte',
    'Sativasur', 'Siachoque', 'Soatá', 'Socha', 'Sogamoso', 'Somondoco',
    'Sora', 'Soracá', 'Sotaquirá', 'Sutatenza', 'Sutamarchán', 'Suesca',
    'Tasco', 'Tenza', 'Tibaná', 'Tibasosa', 'Tinjacá', 'Tipacoque',
    'Toca', 'Togüí', 'Tópaga', 'Tota', 'Tunja', 'Tununguá', 'Turmequé',
    'Tuta', 'Tutazá', 'Úmbita', 'Ventaquemada', 'Viracachá', 'Zetaquira'
  ],
  'Casanare': [
    'Aguazul', 'Chámeza', 'Hato Corozal', 'La Salina', 'Maní', 'Monterrey',
    'Nunchía', 'Orocué', 'Paz de Ariporo', 'Pore', 'Recetor', 'Sabanalarga',
    'Sácama', 'San Luis de Palenque', 'Támara', 'Tauramena', 'Trinidad',
    'Villanueva', 'Yopal'
  ],
  'Arauca': [
    'Arauca', 'Arauquita', 'Cravo Norte', 'Fortul', 'Puerto Rondón',
    'Saravena', 'Tame'
  ],
  'Putumayo': [
    'Colón', 'Mocoa', 'Orito', 'Puerto Asís', 'Puerto Caicedo', 'Puerto Guzmán',
    'Puerto Leguízamo', 'San Francisco', 'San Miguel', 'Santiago', 'Sibundoy',
    'Valle del Guamuez', 'Villagarzón'
  ],
  'Caquetá': [
    'Albania', 'Belén de los Andaquíes', 'Cartagena del Chairá', 'Curillo',
    'El Doncello', 'El Paujil', 'Florencia', 'La Montañita', 'Milán',
    'Morelia', 'Puerto Rico', 'San José del Fragua', 'San Vicente del Caguán',
    'Solano', 'Solita', 'Valparaíso'
  ],
  'Guainía': [
    'Barranco Minas', 'Cacahual', 'Inírida', 'La Guadalupe', 'Mapiripana',
    'Morichal', 'Pana Pana', 'Puerto Colombia', 'San Felipe'
  ],
  'Guaviare': [
    'Calamar', 'El Retorno', 'Miraflores', 'San José del Guaviare'
  ],
  'Vaupés': [
    'Carurú', 'Mitú', 'Taraira'
  ],
  'Vichada': [
    'Cumaribo', 'La Primavera', 'Puerto Carreño', 'Santa Rosalía'
  ],
  'Amazonas': [
    'El Encanto', 'La Chorrera', 'La Pedrera', 'La Victoria', 'Leticia',
    'Miriti - Paraná', 'Puerto Alegría', 'Puerto Arica', 'Puerto Nariño',
    'Puerto Santander', 'Tarapacá'
  ],
  'San Andrés y Providencia': [
    'Providencia', 'San Andrés'
  ]
} as const;

export const DEPARTAMENTOS_OPTIONS = Object.keys(MUNICIPIOS_POR_DEPARTAMENTO) as string[];
