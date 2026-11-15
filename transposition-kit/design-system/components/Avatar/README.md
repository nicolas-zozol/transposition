# Avatar

Une pastille ronde pour une personne : sa photo, sinon ses initiales. Le consommateur fournit `name` (d'où sont tirées les initiales et le texte alternatif), `src` si une photo existe, et `size` en pixels (24, 32 par défaut, 40, 64).

- Dans la Topbar pour l'utilisateur connecté (32 px), dans une carte de contact (64 px).
- Les initiales sont celles des deux premiers mots de `name` : passer « Claire Leroy », pas « LEROY Claire Marie ».
- Jamais de visage inventé : sans photo fournie, laisser les initiales.
