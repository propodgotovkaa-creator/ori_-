# Картинки для позиций звука Л

Built-in image_gen tool, transparent outputs. Reference: assets/words/boat.png for material and painterly style; assets/character/hero.png and assets/ending/farewell.png for character identity. No CLI/API fallback.

Saved assets:
- assets/words/middle-atlas.png — 11 separate pictures, 4×3 row-major atlas, final cell empty.
- assets/words/final-atlas.png — 10 separate pictures, 4×3 atlas, last two cells empty.
- assets/words/cluster-atlas.png — 10 separate pictures, 4×3 atlas, last two cells empty.
- assets/character/hero-v2.png — 8 animation frames, 4×2 atlas.

Prompt set:
1. Soft detailed hand-painted fairytale object atlas, regular 4×3 square cells, no labels, text, grid or background, each object fully inside its cell. Order: hand saw, spinning top, jug of milk, soap; tent, shark, safety pin, triangular three-string balalaika; acorns, hammer, stone well with roof, empty. Crisp readable silhouettes and natural material shading matching boat reference.
2. Same style and grid. Order: table, woodpecker, chair, pencil case; donkey, torch, empty goblet, water buffalo; potion cauldron with green potion, goat, empty, empty. Follow-up: remove all white and gray background to actual alpha, preserve positions and object detail including white fur and glass highlights.
3. Same style and grid. Order: squirrel, apple, fir tree, four-tine fork; strawberry, cloud, sewing needle with eye and red thread, blue yarn ball; elephant, sausage ring, empty, empty.
4. Preserve white pearl-cyan lizard identity, blue eyes, leaf crest and curved tail; cleaner detailed painterly scales and antialiased silhouettes. Exact 4×2 grid: four run frames, idle, jump up, fall, crouched landing. Consistent body scale, right-facing, full tails and paws. Follow-up: remove gray/white background haze and shadow, preserve exact poses and grid; no outer fuzzy glow.

The requested large image sizes were normalized by the tool: final word atlases 1448×1086; character 1774×887. They are rendered at much smaller display sizes. No bitmap resampling or manual background removal was used.
