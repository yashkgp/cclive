// Widget registry. Built-in widgets are imported here and dispatched by `type`.

import { gitWidget } from './git.js';
import { stockWidget } from './stock.js';
import { espnWidget } from './espn.js';
import { cricketWidget } from './cricket.js';

export const REGISTRY = {
  git: gitWidget,
  stock: stockWidget,
  espn: espnWidget,
  cricket: cricketWidget,
};

export const resolve = (type) => REGISTRY[type] || null;
