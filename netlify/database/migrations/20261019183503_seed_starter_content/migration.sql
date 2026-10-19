-- First-run content: the workshops, wall, testimonials and FAQ the site launched with.
INSERT INTO events (name, craft, level, date, start_time, end_time, capacity, held_seats, price, blurb, image, alt, tone, is_new, status) VALUES
  ('Mirror Painting Date', 'Peinture', 'Beginner', '2026-10-24', '15:00', '17:00', 12, 9, 300, 'Bring your bestie, pick a palette, paint a tulip border around your own mirror. It goes home dry and ready to hang.', 'asset:painted-mirror', 'Round mirror on a wooden easel painted with a border of pink tulips, palette in front', 'peri', 0, 'open'),
  ('Just Crochet', 'Crochet', 'Beginner', '2026-11-01', '14:00', '16:00', 12, 5, 250, 'Learn the loops that make a flower, then string a whole garland of them. You walk out wearing one.', 'asset:crochet-daisies', 'Crocheted cream and mustard daisies laid out on a round wooden table', 'blush', 0, 'open'),
  ('Broderie & Pause Café', 'Broderie', 'Beginner', '2026-11-07', '11:00', '13:00', 12, 3, 250, 'A hoop, a needle, six colours of thread. Stitch a little bouquet you can frame or sew straight onto a jacket.', NULL, '', 'mint', 1, 'open'),
  ('Flower Market Bag', 'Crochet', 'Intermediate', '2026-11-15', '13:00', '15:30', 10, 8, 350, 'Sunflower motifs, joined panels, finished straps. The busiest afternoon on the calendar — worth it.', 'asset:sunflower-bags', 'Sunflower-motif crocheted market bags hanging on a rail', 'amber', 0, 'open');
--> statement-breakpoint
INSERT INTO wall_posts (image, alt, instagram, title, craft, featured, tall) VALUES
  ('asset:shaggy-rug', 'Dense multicoloured shaggy crocheted rug', 'sarah.k', 'Colour Riot, Nov', 'Crochet', 1, 1),
  ('asset:patchwork', 'Granny-square patchwork blanket in jewel tones over a sofa', 'cozy.creations', 'Granny Squares, Oct', 'Crochet', 0, 0),
  ('asset:rainbow-beanie', 'Rainbow-striped crocheted beanie photographed outdoors', 'emma.makes', 'Beanie Night, Dec', 'Crochet', 0, 0),
  ('asset:mustard-throw', 'Mustard cable-knit throw folded over a white armchair', 'lisa.c', 'Slow Sunday, Jan', 'Crochet', 0, 0),
  ('asset:mesh-bag', 'Lime open-mesh crocheted market bag laid out on a grey knit jumper', 'jenny.stitches', 'Market Bag, Sep', 'Crochet', 0, 0),
  ('asset:blanket', 'Chevron-striped handmade blanket in blues and pinks', 'nour.makes', 'Ripple Blanket, Nov', 'Crochet', 1, 1),
  ('asset:star-blanket', 'Pink and cream twelve-point star blanket seen from above', 'amal.b', 'Star Blanket, Dec', 'Crochet', 0, 0),
  ('asset:mesh-in-progress', 'Hands working a lime mesh crochet panel with a hook, yarn ball resting on a red bag', 'happy.hooker', 'First Loops, Jan', 'Crochet', 0, 0),
  ('asset:tote', 'Striped crocheted tote bag in coral, olive and cream with wooden handles', 'salma.t', 'Flower Market Bag, Oct', 'Crochet', 0, 0),
  ('asset:beanie', 'Chunky olive-green hand-crocheted beanie', 'craft.with.me', 'Beanie Night, Dec', 'Crochet', 0, 0),
  ('asset:painted-glass', 'Hand holding a wine glass hand-painted with pink and white daisies and a gold bee', 'the_girlies__club', 'Glass Painting, Sep', 'Peinture', 0, 0),
  ('asset:painted-mirror', 'Round mirror on a wooden easel painted with a border of pink tulips', 'the_girlies__club', 'Mirror Painting Date, Sep', 'Peinture', 0, 0),
  ('asset:painted-tote', 'Canvas tote bag hand-painted with grapefruit, hibiscus and pomegranate motifs', 'the_girlies__club', 'Tote Painting, Aug', 'Peinture', 0, 0);
--> statement-breakpoint
INSERT INTO testimonials (quote, name, role, avatar, tone, position) VALUES
  ('I booked alone and spent the whole drive there panicking about it. By the pause café I had four new numbers in my phone.', 'Maya Chen', 'Came solo, stayed for six sessions', 'asset:maya', 'blush', 0),
  ('Two hours where nobody could reach me and I made an actual flower with my hands. Cheaper than therapy and I got a garland out of it.', 'Lisa Taylor', 'Therapist (yes, really)', 'asset:lisa', 'cream', 1),
  ('Painted on the Sunday, hung it on the Monday. Got 15 DMs asking where I bought it. Told them I made it. 😎', 'Monica Stone', 'Paint & sip regular', 'asset:monica', 'amber', 2),
  ('I have never once finished a craft project at home. Finished this one before the session ended. Turns out I just needed someone sitting next to me.', 'Samantha Ray', 'First-timer, Jan session', 'asset:samantha', 'peri', 3),
  ('Booked it as a birthday thing for six of us. The girls still talk about it. We''re doing the broderie one next.', 'Casey Kim', 'Booked a private table', 'asset:casey', 'mint', 4),
  ('My hands needed this. My brain needed this. It''s the only two hours a month nobody in my house can find me. 10/10 no notes.', 'Riley Morgan', 'Mum of 3, a regular', 'asset:riley', 'lime', 5);
--> statement-breakpoint
INSERT INTO faqs (question, answer, position) VALUES
  ('I''ve never done this before. Is that a problem?', 'Not at all — most girlies arrive with zero experience. Every session starts from the very first step and someone is always at the table to help you untangle.', 0),
  ('Can I come on my own?', 'Please do. Half the table usually comes solo, and the pause café is built for meeting people. You will not leave alone.', 1),
  ('Is it really women only?', 'Yes — 100% femmes, every session. It''s a space to create and switch off, and we keep it that way.', 2),
  ('What''s included in the price?', 'Everything: materials, tools, the pause café, and the finished piece you take home. Paint is set or baked before you leave where the craft needs it.', 3),
  ('How do I book a seat?', 'Pick a date on the calendar and tap Reserve — it takes a minute. We confirm your seat by WhatsApp or Instagram and send you the address. You can still DM us if you prefer.', 4),
  ('Where do the workshops happen?', 'In Casablanca. The exact spot depends on the session and comes with your booking confirmation.', 5),
  ('Can you come to my event?', 'Yes — on se déplace. Birthdays, EVJF, baby showers, team days. DM us the date, the headcount and the craft you like.', 6),
  ('What if I can''t make it anymore?', 'Tell us at least 48 hours before and we move you to another date for free.', 7);
