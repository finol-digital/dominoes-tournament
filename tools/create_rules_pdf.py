from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'Tournament Rules.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
c = canvas.Canvas(str(OUT), pagesize=(612, 792))
c.setTitle('Dominoes Tournament Rules - 24 Players')
c.setAuthor('Tournament Organizer')
ink = colors.HexColor('#17232B')
muted = colors.HexColor('#43515B')
c.setFillColor(ink)
c.setFont('Helvetica-Bold', 26)
c.drawString(42, 741, 'DOMINOES TOURNAMENT')
c.setFont('Helvetica', 12)
c.drawString(42, 720, 'Official tournament format & scoring rules')
c.setStrokeColor(ink)
c.setLineWidth(1.2)
c.line(42, 707, 570, 707)
c.setFillColor(colors.HexColor('#EEF1F3'))
c.roundRect(42, 665, 528, 29, 4, fill=1, stroke=0)
c.setFillColor(ink)
c.setFont('Helvetica-Bold', 10)
c.drawCentredString(306, 676, '4 GAMES EACH   /   ROTATING PARTNERS   /   TOP 8 PLAYERS ADVANCE')

body = ParagraphStyle('body', fontName='Helvetica', fontSize=10.5, leading=14.2,
                      textColor=ink, spaceAfter=0)
y = 647

def para(text, gap=7):
    global y
    p = Paragraph(text, body)
    _, h = p.wrap(528, 700)
    p.drawOn(c, 42, y-h)
    y -= h + gap

def heading(text):
    global y
    c.setFillColor(ink)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(42, y-11, text)
    y -= 20

heading('1  QUALIFYING PHASE')
para('The planned field is 24 players on six tables; the final player count may vary. Each table '
     'has two teams of two. Every player must play exactly four qualifying matches. If more matches are needed than tables '
     'available, finish all waves of a round before starting the next round.')
para('Partners rotate each round. The organizer assigns a randomized, prepared schedule with '
     'no repeated teammates and as few repeated tablemates as possible. If the player count is not '
     'a multiple of four, rotate byes as evenly as possible. A bye earns no win, loss, or points and '
     'is not a played match. Everyone plays exactly four matches. Players who reach four sit out. '
     'The last round uses only the tables needed for players still short of four. With 24 players, play four rounds.')

heading('2  MATCH SCORING')
para('Play successive hands until one team reaches <b>100 or more points</b>. That team wins the match. '
     'The race to 100 counts as one match; individual hands do not count as separate match wins.')
para('Both teammates receive their team\'s <b>full final score</b> toward their individual qualifying totals. '
     'Points above 100 count in full. Each winning player also receives one match win; losing players keep '
     'their points but receive no win. Scores reset to zero for each new match.')
para('<b>Example:</b> A 108-75 result gives each winner <b>1 win + 108 points</b> and each loser '
     '<b>0 wins + 75 points</b>. Both teams confirm the final score before it is reported to the organizer.')

heading('3  RANKING & QUALIFICATION')
para('After all scheduled rounds are complete and everyone has played exactly four matches, rank players by: <b>(1) highest win percentage</b> '
     '(wins divided by matches played); <b>(2) highest average points</b> (total points divided by '
     'matches played); <b>(3) public random draw</b> if both are tied. Compare full values, not rounded '
     'display numbers. With equal matches played, this is equivalent to wins, then total points.')
para('The organizer runs the tracker\'s random draw publicly after confirming all qualifying scores. '
     'The drawn order assigns the tied players\' ranks and is saved; refreshing does not redraw.')
para('The <b>top eight individual players</b> qualify and are seeded 1 through 8. They form four fixed teams: '
     '<b>1+8, 2+7, 3+6, and 4+5</b>. All other players do not advance.')

heading('4  SEMIFINALS & FINAL')
para('<b>Semifinal A:</b> (1+8) vs (4+5) &nbsp;&nbsp;&nbsp;&nbsp; <b>Semifinal B:</b> (2+7) vs (3+6)', gap=6)
para('The semifinal winners meet in the final. Teams keep the same partners for both playoff rounds. '
     'Each playoff match is a fresh race to <b>100 or more points</b>; qualifying wins and points do not carry '
     'into playoff scores. One loss eliminates a team. The team that wins the final is the tournament champion.')

heading('5  GAMEPLAY RULES')
para('These rules define the tournament format and scoring. Before play begins, the host must announce '
     'the domino variant and house rules, including the opening player, legal plays, passing or drawing, '
     'blocked or tied hands, and points awarded per hand. Apply those rules consistently at every table.', gap=0)

assert y >= 48, f'Content too low: {y}'
c.setStrokeColor(colors.HexColor('#C9D0D5'))
c.setLineWidth(0.5)
c.line(42, 37, 570, 37)
c.setFillColor(muted)
c.setFont('Helvetica', 8)
c.drawString(42, 24, 'Updated rules: rotating byes; win percentage, then average points, then random draw')
c.drawRightString(570, 24, 'Print on US Letter at actual size')
c.save()
reader = PdfReader(OUT)
assert len(reader.pages) == 1
text = reader.pages[0].extract_text()
for expected in ['108-75', 'public random draw', '1+8', '2+7', 'win percentage']:
    assert expected in text, expected
print(f'Created and text-checked: {OUT}; bottom of content: {y:.1f} pt')
