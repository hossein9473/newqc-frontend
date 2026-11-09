# درخواست پکیج بک‌اند ۰۲ — ورود از شاخص داشبورد به تماس‌های دقیق آن

## هدف و روش تحویل

کاربر انتظار دارد با کلیک روی «تماس‌های با نمره کمتر از ۶۰» یا «پردازش ناموفق در تماس‌های واجد شرایط» دقیقاً همان تماس‌های شمارش‌شده را ببیند. این قابلیت نیاز محصول است. نسخهٔ فعلی را بررسی کن و پکیج تغییرات محدود، diff، تست و راهنمای اعمال تحویل بده تا کاربر خودش در مخزن بک‌اند اعمال و Commit/Push کند. مخزن اصلی کاربر را تغییر نده؛ روی نسخهٔ کاری جدا کار کن. اگر سورس جدید در دسترس نیست، ابتدا آن را بخواه.

## چرا API فعلی کافی نیست؟

در backend/app/api/routes/report_dashboard.py، low_score_calls فقط تماس‌های eligible با آخرین EvaluationRun تکمیل‌شده و percentage غیر null و **کمتر از** low_score_below است. failed_processing_calls فقط تماس‌های eligible با processing_status برابر failed است.

در backend/app/api/routes/reports.py، فیلتر score_max **کوچک‌تر یا مساوی** است؛ فیلتر eligibility موجود نیست. بنابراین score_max=60 تماس دقیقاً ۶۰ را هم می‌آورد؛ processing_status=failed به‌تنهایی هم محدودیت eligible را اعمال نمی‌کند. استفاده از این لینک‌ها می‌تواند تعداد و فهرست را ناسازگار کند. فرانت نباید با دریافت همهٔ صفحات یا حذف محلی ردیف‌ها این مسئله را پنهان کند.

## قرارداد پیشنهادی

به GET /api/v1/reports/calls دو پارامتر اختیاری اضافه شوند:

- dashboard_metric: Literal['low_score', 'failed_processing'] | None = None
- low_score_below: float، بازهٔ ۰ تا ۱۰۰، پیش‌فرض ۶۰؛ همان تعریف dashboard overview.

بدون dashboard_metric رفتار کنونی حفظ شود.

با low_score شروط زیر هم‌زمان اعمال شوند:

1. Call.eligibility_status == 'eligible'
2. آخرین Run مطابق همان join/دامنهٔ مجوز فعلی، status == 'completed'
3. percentage غیر null و percentage < low_score_below

با failed_processing شروط زیر اعمال شوند:

1. Call.eligibility_status == 'eligible'
2. Call.processing_status == 'failed'

فیلترهای مشترک date_from/date_to، department_id، support_agent_id و source_type با همان معنی روز تهران حفظ شوند. فیلترهای اضافهٔ فهرست در صورت ارسال به‌صورت AND ترکیب شوند؛ فرانت در لینک اولیه فقط فیلترهای مشترک و metric را می‌فرستد. limit/offset/sort و total بر همان مجموعهٔ فیلترشده اعمال شوند. شرط metric پیش از شمارش و صفحه‌بندی در SQL باشد.

نمونه:

```text
/api/v1/reports/calls?dashboard_metric=low_score&low_score_below=60&department_id=1
/api/v1/reports/calls?dashboard_metric=failed_processing&department_id=1
```

اگر راه دقیق‌تر و هم‌سازتری پیشنهاد می‌کنی، قرارداد نهایی را پیش از گسترش دامنه مشخص کن. نیازی به Migration، تغییر prompt، اجرای AI یا تغییر دادهٔ تاریخی نیست.

## تست‌های پذیرش

- با فیلترهای مشترک یکسان، total فهرست metric دقیقاً با low_score_calls یا failed_processing_calls در overview برابر باشد (در دادهٔ ثابت تست).
- نمرهٔ ۵۹٫۹۹ وارد شود؛ ۶۰ و بالاتر وارد نشوند. NULL و آخرین Run ناموفق وارد low_score نشوند؛ موفقیت قدیمی با شکست جدید جایگزین نشود.
- شکست eligible وارد failed_processing شود؛ شکست ineligible وارد نشود. این معیار صرفاً شکست ارزیابی نیست.
- مرزهای ۰ و ۱۰۰ برای threshold، آستانهٔ سفارشی و مقدار نامعتبر بررسی شوند.
- فیلتر روز تهران، دپارتمان، کارشناس و منبع، total و pagination بررسی شوند.
- admin/manager و supervisor مجاز پشتیبانی شوند؛ scope سوپروایزر و منع analyst حفظ شوند.
- بدون metric، پاسخ و رفتار قبلی فهرست بدون تغییر باشد.
- OpenAPI پارامترهای جدید را داشته باشد؛ responseها به دادهٔ غیرضروری گسترش نیابند.

## تحویل

ZIP فایل‌های تغییرکرده با مسیر نسبی، diff، APPLY_FA.md، VALIDATION.md با نتایج واقعی، قرارداد کوتاه برگشتی برای چت فرانت و دستور Commit/Push برای کاربر. تست‌های مرتبط reports/dashboard اجرا شوند. اجرای تست روی دادهٔ جدا؛ بدون اطلاعات محرمانه و دادهٔ تماس واقعی در بسته.

## وضعیت فرانت

منوی فعال، دکمهٔ پاک‌کردن فیلترها و لینک باکس کل تماس‌ها مستقل از این تغییر قابل اجرا هستند. دو باکس metric هنوز به فهرست تقریبی لینک نشده‌اند. پس از اعمال و اعلام قرارداد، فرانت لینک دقیق، عنوان فیلتر metric و حفظ آن در صفحه‌بندی/بازگشت را پیاده‌سازی می‌کند. دادهٔ زنده ممکن است بین دو درخواست تغییر کند؛ تطابق ثابت در تست الزامی است، نه وعدهٔ snapshot بین درخواست‌های واقعی.
