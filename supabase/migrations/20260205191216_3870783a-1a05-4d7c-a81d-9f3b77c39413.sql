-- ============================================================
-- INSERT DRILL CATEGORIES FOR ALL SPORTS (11 remaining)
-- ============================================================

-- Golf categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('golf-putting', 'golf', 'Putting', 5, 4),
('golf-driving', 'golf', 'Driving', 5, 4),
('golf-chipping', 'golf', 'Chipping', 5, 4),
('golf-iron-play', 'golf', 'Iron Play', 5, 4),
('golf-bunker', 'golf', 'Bunker Shots', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Tennis categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('tennis-forehand', 'tennis', 'Forehand', 5, 4),
('tennis-backhand', 'tennis', 'Backhand', 5, 4),
('tennis-serve', 'tennis', 'Serve', 5, 4),
('tennis-volley', 'tennis', 'Volley', 5, 4),
('tennis-footwork', 'tennis', 'Footwork', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Cricket categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('cricket-batting', 'cricket', 'Batting', 5, 4),
('cricket-bowling', 'cricket', 'Bowling', 5, 4),
('cricket-fielding', 'cricket', 'Fielding', 5, 4),
('cricket-wicketkeeping', 'cricket', 'Wicketkeeping', 5, 4),
('cricket-running', 'cricket', 'Running Between Wickets', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Padel categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('padel-forehand', 'padel', 'Forehand', 5, 4),
('padel-backhand', 'padel', 'Backhand', 5, 4),
('padel-serve', 'padel', 'Serve', 5, 4),
('padel-volley', 'padel', 'Volley', 5, 4),
('padel-wall-play', 'padel', 'Wall Play', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Basketball categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('basketball-shooting', 'basketball', 'Shooting', 5, 4),
('basketball-dribbling', 'basketball', 'Dribbling', 5, 4),
('basketball-passing', 'basketball', 'Passing', 5, 4),
('basketball-defense', 'basketball', 'Defense', 5, 4),
('basketball-rebounding', 'basketball', 'Rebounding', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Rugby categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('rugby-passing', 'rugby', 'Passing', 5, 4),
('rugby-tackling', 'rugby', 'Tackling', 5, 4),
('rugby-kicking', 'rugby', 'Kicking', 5, 4),
('rugby-rucking', 'rugby', 'Rucking', 5, 4),
('rugby-lineout', 'rugby', 'Lineout', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Table Tennis categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('tabletennis-forehand', 'table tennis', 'Forehand', 5, 4),
('tabletennis-backhand', 'table tennis', 'Backhand', 5, 4),
('tabletennis-serve', 'table tennis', 'Serve', 5, 4),
('tabletennis-spin', 'table tennis', 'Spin Control', 5, 4),
('tabletennis-footwork', 'table tennis', 'Footwork', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Baseball categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('baseball-hitting', 'baseball', 'Hitting', 5, 4),
('baseball-pitching', 'baseball', 'Pitching', 5, 4),
('baseball-fielding', 'baseball', 'Fielding', 5, 4),
('baseball-baserunning', 'baseball', 'Base Running', 5, 4),
('baseball-catching', 'baseball', 'Catching', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- American Football categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('amfootball-passing', 'american football', 'Passing', 5, 4),
('amfootball-rushing', 'american football', 'Rushing', 5, 4),
('amfootball-receiving', 'american football', 'Receiving', 5, 4),
('amfootball-blocking', 'american football', 'Blocking', 5, 4),
('amfootball-tackling', 'american football', 'Tackling', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Field Hockey categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('fieldhockey-dribbling', 'field hockey', 'Dribbling', 5, 4),
('fieldhockey-passing', 'field hockey', 'Passing', 5, 4),
('fieldhockey-shooting', 'field hockey', 'Shooting', 5, 4),
('fieldhockey-defense', 'field hockey', 'Defense', 5, 4),
('fieldhockey-goalkeeping', 'field hockey', 'Goalkeeping', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Volleyball categories
INSERT INTO public.drill_categories (id, sport, name, levels, drills_per_level) VALUES
('volleyball-serve', 'volleyball', 'Serve', 5, 4),
('volleyball-spike', 'volleyball', 'Spike', 5, 4),
('volleyball-block', 'volleyball', 'Block', 5, 4),
('volleyball-dig', 'volleyball', 'Dig', 5, 4),
('volleyball-setting', 'volleyball', 'Setting', 5, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;