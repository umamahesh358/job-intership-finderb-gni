from reportlab.pdfgen import canvas

c = canvas.Canvas("test-data/test_resume.pdf")
c.drawString(100, 750, "John Doe - Frontend Engineer. Skills: React, JS, Node")
c.save()
