import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'sospneus.sqlite');
const sqlPath = path.resolve(__dirname, '../../sql/sospneus.sql');

export const db = new DatabaseSync(dbPath);
db.exec(fs.readFileSync(sqlPath, 'utf-8'));

export function query(sql, params = []) {
  return db.prepare(sql).all(...params);
}

export function get(sql, params = []) {
  return db.prepare(sql).get(...params) || null;
}

export function run(sql, params = []) {
  const res = db.prepare(sql).run(...params);
  return {
    changes: Number(res.changes),
    lastInsertRowid: Number(res.lastInsertRowid)
  };
}

function inicializarSeeds() {
  const countU = get('SELECT COUNT(*) as total FROM usuarios');
  if (countU && countU.total === 0) {
    const hashBase = bcrypt.hashSync('SOSPneus@2026', 10);
    const hashFrota = bcrypt.hashSync('Resgate@2026', 10);

    run(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)',
      ['Cláudio Rocha (Central de Despacho 24h)', 'base@sospneus-demo.com.br', hashBase, 'operador_base']
    );
    run(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)',
      ['Furgão Móvel 01 (Unidade Rápida)', 'viatura01@sospneus-demo.com.br', hashFrota, 'socorrista']
    );
  }

  const countP = get('SELECT COUNT(*) as total FROM pneus');
  if (countP && countP.total === 0) {
    const listaPneus = [
      [
        '175/70 R14', 14, 'Pirelli', 'Cinturato P1 Plus', 'Urbano / Estrada', '88T XL',
        'Inmetro Aderência B • Consumo C • 69dB', 389.00, 1480.00, 16,
        'VW Gol, Voyage, Fox, Fiat Palio, Strada, Siena, Chevrolet Onix Joy, Prisma', 1
      ],
      [
        '185/65 R15', 15, 'Michelin', 'Energy XM2+', 'Urbano / Estrada', '88H',
        'Inmetro Aderência A • Consumo C • 68dB', 479.00, 1840.00, 12,
        'Hyundai HB20, Chevrolet Onix Plus, Renault Sandero, Logan, Nissan Versa, Honda Fit', 1
      ],
      [
        '205/55 R16', 16, 'Continental', 'PowerContact 2', 'Urbano / Estrada', '91V',
        'Inmetro Aderência B • Consumo B • 70dB', 529.00, 2020.00, 20,
        'Toyota Corolla, Honda Civic, VW Virtus, Golf, Jetta, Chevrolet Cruze', 1
      ],
      [
        '215/60 R17', 17, 'Bridgestone', 'Turanza T005 SUV', 'SUV / Highway', '96H',
        'Inmetro Aderência A • Consumo B • 71dB', 689.00, 2650.00, 8,
        'Jeep Renegade, Compass, Hyundai Creta, Nissan Kicks, Renault Duster, Captur', 1
      ],
      [
        '225/45 R17', 17, 'Michelin', 'Pilot Sport 5', 'Urbano / Estrada', '94Y XL',
        'Inmetro Aderência A • Alta Performance • 71dB', 799.00, 3080.00, 8,
        'VW Golf GTI, Jetta GLI, Audi A3, BMW 320i, Mercedes C180, Corolla GR-S', 0
      ],
      [
        '265/65 R17', 17, 'BFGoodrich', 'All-Terrain T/A KO2', 'Carga / Utilitário', '120/117S',
        'Inmetro Homologado Uso Misto Pesado', 1290.00, 4980.00, 6,
        'Toyota Hilux, Chevrolet S10, Ford Ranger, VW Amarok, Mitsubishi L200 Triton', 0
      ]
    ];

    for (const p of listaPneus) {
      run(
        `INSERT INTO pneus (
          medida, aro, marca, modelo, tipo_terreno, indice_carga_vel, selo_inmetro,
          preco_unitario, preco_kit4, estoque, aplicacao_carros, destaque
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p
      );
    }

    run(
      `INSERT INTO chamados_socorro (
        protocolo, tipo_emergencia, distancia_km, tempo_chegada_min, valor_total_estimado,
        nome_motorista, telefone, localizacao_referencia, veiculo_medida, consentimento_lgpd, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'SOS-24H-9012', 'Pneu Furado / Troca de Estepe', 4.5, 19, 117.00,
        'Alexandre Pires (Fictício)', '(11) 99111-2233',
        'Marginal Pinheiros, Posto Shell antes da Ponte Estaiada', 'Honda Civic — 205/55 R16', 1, 'Em Deslocamento'
      ]
    );
  }
}

inicializarSeeds();

export default { db, query, get, run };
