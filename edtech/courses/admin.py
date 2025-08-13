
from django.contrib import admin
from .models import PDFDocument, Course, Lesson, LessonPDF
from .enrollment import Enrollment

class LessonPDFInline(admin.TabularInline):
	model = LessonPDF
	extra = 1

class LessonAdmin(admin.ModelAdmin):
	list_display = ("title", "course", "created_at")
	inlines = [LessonPDFInline]

admin.site.register(PDFDocument)
admin.site.register(Course)
admin.site.register(Lesson, LessonAdmin)
admin.site.register(LessonPDF)
admin.site.register(Enrollment)