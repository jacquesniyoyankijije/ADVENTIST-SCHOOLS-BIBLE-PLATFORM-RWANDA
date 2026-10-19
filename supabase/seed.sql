-- 0003 schema seed: initial sample data for the Adventist Schools & Bible
-- Platform — Rwanda. Safe to re-run: it skips itself if students exist.
-- All records are illustrative sample data, not real people or schools'
-- confidential records. Bible verses are from the King James Version
-- (public domain). EGW entries are metadata + links only.

do $$
declare
  -- deterministic ids for cross references
  f_north uuid := 'b0000000-0000-4000-8000-000000000001';
  f_south uuid := 'b0000000-0000-4000-8000-000000000002';
  f_east  uuid := 'b0000000-0000-4000-8000-000000000003';
  f_west  uuid := 'b0000000-0000-4000-8000-000000000004';
  f_kigali uuid := 'b0000000-0000-4000-8000-000000000005';

  s_gitwe   uuid := 'a0000000-0000-4000-8000-000000000001';
  s_kigali  uuid := 'a0000000-0000-4000-8000-000000000002';
  s_rwankeri uuid := 'a0000000-0000-4000-8000-000000000003';
  s_mugonero uuid := 'a0000000-0000-4000-8000-000000000004';
  s_gishari uuid := 'a0000000-0000-4000-8000-000000000005';
  s_ngoma   uuid := 'a0000000-0000-4000-8000-000000000006';
  s_byangabo uuid := 'a0000000-0000-4000-8000-000000000007';
  s_muhanga uuid := 'a0000000-0000-4000-8000-000000000008';

  sub_rel uuid := 'c0000000-0000-4000-8000-000000000001';
  sub_math uuid := 'c0000000-0000-4000-8000-000000000002';
  sub_eng uuid := 'c0000000-0000-4000-8000-000000000003';
  sub_sci uuid := 'c0000000-0000-4000-8000-000000000004';
  sub_ict uuid := 'c0000000-0000-4000-8000-000000000005';

  bk_psalms uuid := 'd0000000-0000-4000-8000-000000000001';
  bk_proverbs uuid := 'd0000000-0000-4000-8000-000000000002';
  bk_genesis uuid := 'd0000000-0000-4000-8000-000000000003';
  bk_exodus uuid := 'd0000000-0000-4000-8000-000000000004';
  bk_matthew uuid := 'd0000000-0000-4000-8000-000000000005';
  bk_john uuid := 'd0000000-0000-4000-8000-000000000006';
  bk_romans uuid := 'd0000000-0000-4000-8000-000000000007';
  bk_revelation uuid := 'd0000000-0000-4000-8000-000000000008';
  bk_1cor uuid := 'd0000000-0000-4000-8000-000000000009';
begin
  if exists (select 1 from public.students limit 1) then
    raise notice 'Seed skipped: student data already present.';
    return;
  end if;

  ------------------------------------------------------------------
  -- Fields (administrative regions) and schools
  ------------------------------------------------------------------
  insert into public.fields(id, name) values
    (f_north, 'North Rwanda Field'),
    (f_south, 'South Rwanda Field'),
    (f_east,  'East Rwanda Field'),
    (f_west,  'West Rwanda Field'),
    (f_kigali,'Kigali City Field')
  on conflict (name) do nothing;

  insert into public.schools(id, name, code, district, sector, field_id, field_name, union_name, school_type, head_of_school, status) values
    (s_gitwe,  'Gitwe Adventist College', 'GAC', 'Ruhango', 'Gitwe', f_south, 'South Rwanda Field', 'Rwanda Union Mission', 'Boarding', 'Elder Jean Bosco Nshimiyimana', 'Active'),
    (s_kigali, 'Kigali Adventist Academy', 'KAA', 'Gasabo', 'Remera', f_kigali, 'Kigali City Field', 'Rwanda Union Mission', 'Day', 'Mrs. Alice Uwimana', 'Active'),
    (s_rwankeri,'Rwankeri Adventist Secondary', 'RAS', 'Rubavu', 'Rwankeri', f_west, 'West Rwanda Field', 'Rwanda Union Mission', 'Boarding', 'Pastor Emmanuel Habimana', 'Active'),
    (s_mugonero,'Mugonero Adventist Secondary', 'MAS', 'Karongi', 'Mugonero', f_west, 'West Rwanda Field', 'Rwanda Union Mission', 'Boarding', 'Mr. Damas Niyonsaba', 'Active'),
    (s_gishari,'Gishari Adventist Academy', 'GAA', 'Rwamagana', 'Gishari', f_east, 'East Rwanda Field', 'Rwanda Union Mission', 'Day', 'Mrs. Claudine Mukandayisenga', 'Active'),
    (s_ngoma,  'Ngoma Adventist Academy', 'NAA', 'Ngoma', 'Kibungo', f_east, 'East Rwanda Field', 'Rwanda Union Mission', 'Day', 'Mr. Silas Rwiririza', 'Active'),
    (s_byangabo,'Byangabo Adventist Secondary', 'BAS', 'Musanze', 'Byangabo', f_north, 'North Rwanda Field', 'Rwanda Union Mission', 'Boarding', 'Mrs. Grace Nyirahabimana', 'Review'),
    (s_muhanga, 'Muhanga Adventist Secondary', 'MUAS', 'Muhanga', 'Muhanga', f_south, 'South Rwanda Field', 'Rwanda Union Mission', 'Day', 'Mr. Eliezer Munyaneza', 'Active')
  on conflict (code) do nothing;

  ------------------------------------------------------------------
  -- Classes and subjects
  ------------------------------------------------------------------
  insert into public.classes(id, school_id, name, academic_year) values
    ('e0000000-0000-4000-8000-000000000001', s_gitwe, 'Senior 3', '2026'),
    ('e0000000-0000-4000-8000-000000000002', s_gitwe, 'Senior 5', '2026'),
    ('e0000000-0000-4000-8000-000000000003', s_kigali, 'Senior 3', '2026'),
    ('e0000000-0000-4000-8000-000000000004', s_kigali, 'Senior 6', '2026'),
    ('e0000000-0000-4000-8000-000000000005', s_rwankeri, 'Senior 4', '2026'),
    ('e0000000-0000-4000-8000-000000000006', s_mugonero, 'Senior 5', '2026'),
    ('e0000000-0000-4000-8000-000000000007', s_gishari, 'Senior 3', '2026'),
    ('e0000000-0000-4000-8000-000000000008', s_ngoma, 'Senior 6', '2026'),
    ('e0000000-0000-4000-8000-000000000009', s_byangabo, 'Senior 4', '2026'),
    ('e0000000-0000-4000-8000-00000000000a', s_muhanga, 'Senior 5', '2026');

  -- Common curriculum subjects (school_id null = shared curriculum)
  insert into public.subjects(id, name, school_id) values
    (sub_rel,  'Religious Studies', null),
    (sub_math, 'Mathematics', null),
    (sub_eng,  'English', null),
    (sub_sci,  'Sciences', null),
    (sub_ict,  'ICT', null);

  ------------------------------------------------------------------
  -- Students (sample data only)
  ------------------------------------------------------------------
  insert into public.students(id, student_code, full_name, school_id, class_id, guardian_name, guardian_phone, status) values
    ('f0000000-0000-4000-8000-000000000001', 'ASB-2026-0001', 'Aline Umutoni', s_gitwe, 'e0000000-0000-4000-8000-000000000001', 'Eric Nshimiyimana', '+250788123001', 'Active'),
    ('f0000000-0000-4000-8000-000000000002', 'ASB-2026-0002', 'Fabrice Kwizera', s_gitwe, 'e0000000-0000-4000-8000-000000000001', 'Joseline Mukamana', '+250788123002', 'Active'),
    ('f0000000-0000-4000-8000-000000000003', 'ASB-2026-0003', 'Sandrine Ingabire', s_gitwe, 'e0000000-0000-4000-8000-000000000002', 'Jean Pierre Habinshuti', '+250788123003', 'Active'),
    ('f0000000-0000-4000-8000-000000000004', 'ASB-2026-0004', 'Thierry Nkurunziza', s_gitwe, 'e0000000-0000-4000-8000-000000000002', 'Alphonse Nkurunziza', '+250788123004', 'Active'),
    ('f0000000-0000-4000-8000-000000000005', 'ASB-2026-0005', 'Diane Keza', s_kigali, 'e0000000-0000-4000-8000-000000000003', 'Sylvie Mutesi', '+250788123005', 'Active'),
    ('f0000000-0000-4000-8000-000000000006', 'ASB-2026-0006', 'Patrick Mugisha', s_kigali, 'e0000000-0000-4000-8000-000000000003', 'Godfrey Mugisha', '+250788123006', 'Active'),
    ('f0000000-0000-4000-8000-000000000007', 'ASB-2026-0007', 'Chantal Nirere', s_kigali, 'e0000000-0000-4000-8000-000000000004', 'Beatrice Nyiransengimana', '+250788123007', 'Active'),
    ('f0000000-0000-4000-8000-000000000008', 'ASB-2026-0008', 'Eric Byiringiro', s_kigali, 'e0000000-0000-4000-8000-000000000004', 'Augustin Byiringiro', '+250788123008', 'Active'),
    ('f0000000-0000-4000-8000-000000000009', 'ASB-2026-0009', 'Mireille Uwineza', s_rwankeri, 'e0000000-0000-4000-8000-000000000005', 'Felix Rwagafirilita', '+250788123009', 'Active'),
    ('f0000000-0000-4000-8000-00000000000a', 'ASB-2026-0010', 'Josue Hakizimana', s_rwankeri, 'e0000000-0000-4000-8000-000000000005', 'Pascal Hakizimana', '+250788123010', 'Support'),
    ('f0000000-0000-4000-8000-00000000000b', 'ASB-2026-0011', 'Naomi Kaliza', s_mugonero, 'e0000000-0000-4000-8000-000000000006', 'Immaculee Kampire', '+250788123011', 'Active'),
    ('f0000000-0000-4000-8000-00000000000c', 'ASB-2026-0012', 'Didier Bizimana', s_mugonero, 'e0000000-0000-4000-8000-000000000006', 'Fabien Bizimana', '+250788123012', 'Active'),
    ('f0000000-0000-4000-8000-00000000000d', 'ASB-2026-0013', 'Ines Ishimwe', s_gishari, 'e0000000-0000-4000-8000-000000000007', 'Aline Uwase', '+250788123013', 'Active'),
    ('f0000000-0000-4000-8000-00000000000e', 'ASB-2026-0014', 'Bruno Ndayisaba', s_gishari, 'e0000000-0000-4000-8000-000000000007', 'Oscar Ndayisaba', '+250788123014', 'Active'),
    ('f0000000-0000-4000-8000-00000000000f', 'ASB-2026-0015', 'Grace Umutoniwabo', s_ngoma, 'e0000000-0000-4000-8000-000000000008', 'Samuel Uwizeyimana', '+250788123015', 'Active'),
    ('f0000000-0000-4000-8000-000000000010', 'ASB-2026-0016', 'Kevin Munyaneza', s_ngoma, 'e0000000-0000-4000-8000-000000000008', 'James Munyaneza', '+250788123016', 'Transferred'),
    ('f0000000-0000-4000-8000-000000000011', 'ASB-2026-0017', 'Sarah Nyiramana', s_byangabo, 'e0000000-0000-4000-8000-000000000009', 'Victor Nyiramana', '+250788123017', 'Active'),
    ('f0000000-0000-4000-8000-000000000012', 'ASB-2026-0018', 'Isaac Niyomwungeri', s_byangabo, 'e0000000-0000-4000-8000-000000000009', 'Emmanuel Niyomwungeri', '+250788123018', 'Active'),
    ('f0000000-0000-4000-8000-000000000013', 'ASB-2026-0019', 'Liliane Mukandoli', s_muhanga, 'e0000000-0000-4000-8000-00000000000a', 'Joseph Mukandoli', '+250788123019', 'Active'),
    ('f0000000-0000-4000-8000-000000000014', 'ASB-2026-0020', 'Reuben Habimana', s_muhanga, 'e0000000-0000-4000-8000-00000000000a', 'Charles Habimana', '+250788123020', 'Active');

  ------------------------------------------------------------------
  -- Results (Term I, 2026)
  ------------------------------------------------------------------
  insert into public.results(student_id, subject_id, term, academic_year, score, status) values
    ('f0000000-0000-4000-8000-000000000001', sub_rel, 'Term I', '2026', 88, 'Published'),
    ('f0000000-0000-4000-8000-000000000001', sub_math, 'Term I', '2026', 74, 'Published'),
    ('f0000000-0000-4000-8000-000000000001', sub_eng, 'Term I', '2026', 82, 'Published'),
    ('f0000000-0000-4000-8000-000000000002', sub_rel, 'Term I', '2026', 79, 'Published'),
    ('f0000000-0000-4000-8000-000000000002', sub_math, 'Term I', '2026', 65, 'Review'),
    ('f0000000-0000-4000-8000-000000000003', sub_rel, 'Term I', '2026', 91, 'Published'),
    ('f0000000-0000-4000-8000-000000000003', sub_sci, 'Term I', '2026', 84, 'Published'),
    ('f0000000-0000-4000-8000-000000000005', sub_rel, 'Term I', '2026', 86, 'Published'),
    ('f0000000-0000-4000-8000-000000000005', sub_ict, 'Term I', '2026', 78, 'Published'),
    ('f0000000-0000-4000-8000-000000000007', sub_rel, 'Term I', '2026', 93, 'Published'),
    ('f0000000-0000-4000-8000-000000000009', sub_eng, 'Term I', '2026', 71, 'Published'),
    ('f0000000-0000-4000-8000-00000000000b', sub_rel, 'Term I', '2026', 90, 'Published'),
    ('f0000000-0000-4000-8000-00000000000b', sub_sci, 'Term I', '2026', 69, 'Review'),
    ('f0000000-0000-4000-8000-00000000000d', sub_math, 'Term I', '2026', 77, 'Published'),
    ('f0000000-0000-4000-8000-00000000000f', sub_rel, 'Term I', '2026', 95, 'Published'),
    ('f0000000-0000-4000-8000-000000000011', sub_eng, 'Term I', '2026', 68, 'Draft'),
    ('f0000000-0000-4000-8000-000000000013', sub_rel, 'Term I', '2026', 87, 'Published'),
    ('f0000000-0000-4000-8000-000000000014', sub_ict, 'Term I', '2026', 81, 'Published');

  ------------------------------------------------------------------
  -- Discipline incidents (sample, confidential)
  ------------------------------------------------------------------
  insert into public.discipline_incidents(student_id, category, description, occurred_on, school_id, status) values
    ('f0000000-0000-4000-8000-000000000002', 'Attendance', 'Repeated late arrival for morning worship, three occasions in one week.', date '2026-10-05', s_gitwe, 'Follow-up'),
    ('f0000000-0000-4000-8000-000000000006', 'Conduct', 'Disrespectful language toward a classmate during games period.', date '2026-10-08', s_kigali, 'Resolved'),
    ('f0000000-0000-4000-8000-00000000000a', 'Academic', 'Incomplete assignments across two subjects for two consecutive weeks.', date '2026-09-28', s_rwankeri, 'Open'),
    ('f0000000-0000-4000-8000-00000000000e', 'Uniform', 'Wearing incomplete uniform at the weekly assembly.', date '2026-10-01', s_gishari, 'Resolved'),
    ('f0000000-0000-4000-8000-000000000012', 'Safety', 'Rough play near the dormitory staircase; counselled with the dean of men.', date '2026-10-11', s_byangabo, 'Escalated');

  ------------------------------------------------------------------
  -- Fees: invoices and payments (amounts in RWF)
  ------------------------------------------------------------------
  insert into public.fee_invoices(id, invoice_code, student_id, school_id, term, academic_year, total_due, status, due_date) values
    ('10000000-0000-4000-8000-000000000001', 'INV-1001', 'f0000000-0000-4000-8000-000000000001', s_gitwe, 'Term II', '2026', 320000, 'Partial', date '2026-11-15'),
    ('10000000-0000-4000-8000-000000000002', 'INV-1002', 'f0000000-0000-4000-8000-000000000002', s_gitwe, 'Term II', '2026', 320000, 'Paid', date '2026-11-15'),
    ('10000000-0000-4000-8000-000000000003', 'INV-1003', 'f0000000-0000-4000-8000-000000000005', s_kigali, 'Term II', '2026', 280000, 'Partial', date '2026-11-15'),
    ('10000000-0000-4000-8000-000000000004', 'INV-1004', 'f0000000-0000-4000-8000-000000000007', s_kigali, 'Term II', '2026', 280000, 'Overdue', date '2026-10-10'),
    ('10000000-0000-4000-8000-000000000005', 'INV-1005', 'f0000000-0000-4000-8000-000000000009', s_rwankeri, 'Term II', '2026', 350000, 'Partial', date '2026-11-15'),
    ('10000000-0000-4000-8000-000000000006', 'INV-1006', 'f0000000-0000-4000-8000-00000000000b', s_mugonero, 'Term II', '2026', 350000, 'Waived', date '2026-11-15'),
    ('10000000-0000-4000-8000-000000000007', 'INV-1007', 'f0000000-0000-4000-8000-00000000000d', s_gishari, 'Term II', '2026', 300000, 'Partial', date '2026-11-15'),
    ('10000000-0000-4000-8000-000000000008', 'INV-1008', 'f0000000-0000-4000-8000-00000000000f', s_ngoma, 'Term II', '2026', 300000, 'Paid', date '2026-11-15'),
    ('10000000-0000-4000-8000-000000000009', 'INV-1009', 'f0000000-0000-4000-8000-000000000011', s_byangabo, 'Term II', '2026', 330000, 'Overdue', date '2026-10-10'),
    ('10000000-0000-4000-8000-00000000000a', 'INV-1010', 'f0000000-0000-4000-8000-000000000013', s_muhanga, 'Term II', '2026', 330000, 'Partial', date '2026-11-15');

  insert into public.fee_payments(invoice_id, amount, paid_on, method, reference) values
    ('10000000-0000-4000-8000-000000000001', 180000, date '2026-09-20', 'MOMO', 'MP-0x71a2b'),
    ('10000000-0000-4000-8000-000000000002', 320000, date '2026-09-22', 'Bank', 'BK-884210'),
    ('10000000-0000-4000-8000-000000000003', 150000, date '2026-09-25', 'MOMO', 'MP-0x93f4c'),
    ('10000000-0000-4000-8000-000000000005', 200000, date '2026-09-30', 'Bank', 'BK-991034'),
    ('10000000-0000-4000-8000-000000000007', 120000, date '2026-10-02', 'Cash', 'CR-0451'),
    ('10000000-0000-4000-8000-000000000008', 300000, date '2026-09-28', 'Bank', 'BK-773204'),
    ('10000000-0000-4000-8000-00000000000a', 100000, date '2026-09-15', 'MOMO', 'MP-0x22b9e');

  ------------------------------------------------------------------
  -- Bible content (KJV, public domain)
  ------------------------------------------------------------------
  insert into public.bible_books(id, name, testament, chapter_count, position) values
    (bk_genesis, 'Genesis', 'Old', 50, 1),
    (bk_exodus, 'Exodus', 'Old', 40, 2),
    (bk_psalms, 'Psalms', 'Old', 150, 19),
    (bk_proverbs, 'Proverbs', 'Old', 31, 20),
    (bk_matthew, 'Matthew', 'New', 28, 1),
    (bk_john, 'John', 'New', 21, 4),
    (bk_romans, 'Romans', 'New', 16, 6),
    (bk_1cor, '1 Corinthians', 'New', 16, 7),
    (bk_revelation, 'Revelation', 'New', 22, 27)
  on conflict (name) do nothing;

  insert into public.bible_chapters(book_id, chapter, translation, verses, license) values
    (bk_psalms, 1, 'KJV', jsonb_build_array(
      jsonb_build_object('n', 1, 'text', 'Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.'),
      jsonb_build_object('n', 2, 'text', 'But his delight is in the law of the LORD; and in his law doth he meditate day and night.'),
      jsonb_build_object('n', 3, 'text', 'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.'),
      jsonb_build_object('n', 4, 'text', 'The ungodly are not so: but are like the chaff which the wind driveth away.'),
      jsonb_build_object('n', 5, 'text', 'Therefore the ungodly shall not stand in the judgment, nor sinners in the congregation of the righteous.'),
      jsonb_build_object('n', 6, 'text', 'For the LORD knoweth the way of the righteous: but the way of the ungodly shall perish.')
    ), 'Public domain (KJV)'),
    (bk_psalms, 23, 'KJV', jsonb_build_array(
      jsonb_build_object('n', 1, 'text', 'The LORD is my shepherd; I shall not want.'),
      jsonb_build_object('n', 2, 'text', 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.'),
      jsonb_build_object('n', 3, 'text', 'He restoreth my soul: he leadeth me in the paths of righteousness for his name''s sake.'),
      jsonb_build_object('n', 4, 'text', 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.'),
      jsonb_build_object('n', 5, 'text', 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.'),
      jsonb_build_object('n', 6, 'text', 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.')
    ), 'Public domain (KJV)'),
    (bk_1cor, 13, 'KJV', jsonb_build_array(
      jsonb_build_object('n', 1, 'text', 'Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling cymbal.'),
      jsonb_build_object('n', 2, 'text', 'And though I have the gift of prophecy, and understand all mysteries, and all knowledge; and though I have all faith, so that I could remove mountains, and have not charity, I am nothing.'),
      jsonb_build_object('n', 3, 'text', 'And though I bestow all my goods to feed the poor, and though I give my body to be burned, and have not charity, it profiteth me nothing.'),
      jsonb_build_object('n', 4, 'text', 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,'),
      jsonb_build_object('n', 5, 'text', 'Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil;'),
      jsonb_build_object('n', 6, 'text', 'Rejoiceth not in iniquity, but rejoiceth in the truth;'),
      jsonb_build_object('n', 7, 'text', 'Beareth all things, believeth all things, hopeth all things, endureth all things.'),
      jsonb_build_object('n', 8, 'text', 'Charity never faileth: but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.'),
      jsonb_build_object('n', 9, 'text', 'For we know in part, and we prophesy in part.'),
      jsonb_build_object('n', 10, 'text', 'But when that which is perfect is come, then that which is in part shall be done away.'),
      jsonb_build_object('n', 11, 'text', 'When I was a child, I spake as a child, I understood as a child, I thought as a child: but when I became a man, I put away childish things.'),
      jsonb_build_object('n', 12, 'text', 'For now we see through a glass, darkly; but then face to face: now I know in part; but then shall I know even as also I am known.'),
      jsonb_build_object('n', 13, 'text', 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.')
    ), 'Public domain (KJV)')
  on conflict (book_id, chapter, translation) do nothing;

  ------------------------------------------------------------------
  -- Bible lessons
  ------------------------------------------------------------------
  insert into public.lessons(title, term, week, duration_minutes, sections) values
    ('The Love of God', 'Term II', 1, 20,
      jsonb_build_object(
        'memory_verse', 'John 3:16',
        'objectives', jsonb_build_array('Understand the depth of God''s love', 'Reflect on how love shapes Christian service', 'Memorize John 3:16'),
        'content', 'God''s love is not passive; it moved Him to give His only Son. This lesson explores how divine love transforms our study, our friendships and our service in school and church.',
        'reflection_questions', jsonb_build_array('How has God shown His love to you this week?', 'Who in your school needs to experience that love through you?'),
        'prayer', 'Father, thank You for the gift of Your Son. Teach us to love as You love. Amen.'
      )),
    ('Growing in Wisdom: Proverbs for Students', 'Term II', 2, 20,
      jsonb_build_object(
        'memory_verse', 'Proverbs 1:7',
        'objectives', jsonb_build_array('Value the fear of the Lord as the beginning of knowledge', 'Apply Proverbs to study habits and honesty'),
        'content', 'The book of Proverbs links worship with everyday choices: diligence in study, honesty in exams, kindness in community. True wisdom begins with reverence for God.',
        'reflection_questions', jsonb_build_array('Which Proverb speaks most to your life as a student?', 'What one habit will you change this week?'),
        'prayer', 'Lord, give us wisdom that begins with knowing You. Amen.'
      )),
    ('Serve One Another: The Example of Jesus', 'Term II', 3, 20,
      jsonb_build_object(
        'memory_verse', 'John 13:14',
        'objectives', jsonb_build_array('Study Jesus washing the disciples'' feet', 'Practice humble service at school'),
        'content', 'Before the cross, Jesus took a towel and washed feet. Greatness in His kingdom is measured in service. Students plan one practical act of service for their school this week.',
        'reflection_questions', jsonb_build_array('What holds you back from serving others?', 'Who will you serve this week?'),
        'prayer', 'Lord Jesus, make us servants like You. Amen.'
      ));

  ------------------------------------------------------------------
  -- Ellen G. White library (metadata and links only — text remains
  -- under copyright of the Ellen G. White Estate; link out, do not copy)
  ------------------------------------------------------------------
  insert into public.egw_books(title, category, source_url, license) values
    ('Steps to Christ', 'Devotional', 'https://m.egwwritings.org/en/book/9', 'EGW Estate — link out only'),
    ('The Desire of Ages', 'Life of Christ', 'https://m.egwwritings.org/en/book/19', 'EGW Estate — link out only'),
    ('Education', 'Education', 'https://m.egwwritings.org/en/book/28', 'EGW Estate — link out only'),
    ('The Ministry of Healing', 'Health', 'https://m.egwwritings.org/en/book/37', 'EGW Estate — link out only'),
    ('Christ''s Object Lessons', 'Parables', 'https://m.egwwritings.org/en/book/54', 'EGW Estate — link out only'),
    ('Messages to Young People', 'Youth', 'https://m.egwwritings.org/en/book/142', 'EGW Estate — link out only');

  ------------------------------------------------------------------
  -- Announcements
  ------------------------------------------------------------------
  insert into public.announcements(title, body, audience, tone) values
    ('National Education Sabbath',
     'All schools will join the union-wide Education Sabbath program. Each school should prepare a special program involving students in music, Scripture reading and testimonies.',
     'All schools', 'gold'),
    ('Term II results submission',
     'School administrators should complete grade validation before Friday at 17:00 so the union report can be compiled.',
     'Administrators', 'blue'),
    ('Bible reading plan launch',
     'A new 30-day Bible reading plan for all students and staff begins this week. Progress can be tracked in the Bible Lessons module.',
     'All schools', 'green'),
    ('Fee reminder for Term II',
     'Parents and guardians are reminded that Term II fees fall due on 15 November. Bursars may share payment references through the Fees module.',
     'Parents & Bursars', 'blue');
end $$;
