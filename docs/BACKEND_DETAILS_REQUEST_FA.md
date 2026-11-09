# پیشنهاد تغییر بک‌اند: جزئیات کامل پاسخ ارزیابی

وضعیت: برای بررسی و اجرا توسط کاربر؛ هیچ فایل بک‌اند توسط فرانت تغییر نکرده است.

## شواهد و علت

EvaluationAnswerPayload در backend/app/services/evaluation_response.py شامل score، reason_code، reason، evidence و details است. details یک دیکشنری است و در evaluation_completion.py به EvaluationAnswer.details_json نگاشت می‌شود. فیلد دیتابیس از قبل وجود دارد؛ Migration جدید برای این پیشنهاد لازم نیست.

گزارش فعلی reason و evidence را برمی‌گرداند ولی details_json را حذف می‌کند. این فاصله مانع نمایش جزئیات واقعی جمینای است. پیشنهاد: فیلد عمومی API به نام details و با حفظ تمایز null قدیمی و {} خالی ارائه شود.

## تغییر دقیق پیشنهادی

فایل: C:/Users/Didar/Desktop/aida/newqc/backend/app/api/routes/reports.py

۱. Any به import تایپ افزوده شود:

```python
from typing import Annotated, Any
```

۲. در مدل AnswerDetail افزوده شود:

```python
details: dict[str, Any] | None = None
```

۳. در _build_call_detail و ساخت AnswerDetail، کنار evidence افزوده شود:

```python
details=answer.details_json,
```

این تابع مشترک است، پس هم آخرین ارزیابی و هم اجرای تاریخی مقدار متناظر خودشان را برمی‌گردانند. نیازی به تکرار ارزیابی AI یا تغییر نمره نیست. جزئیات فقط در پاسخ جزئیات تماس مجاز نمایش داده شود، نه فهرست تماس یا خروجی عمومی فایل.

## بررسی لازم توسط توسعهٔ بک‌اند

در backend/tests/test_reports.py سناریوهای زیر اضافه/تکمیل شوند:

- پاسخ مجاز details شامل مقادیر تو در تو، صفر، false و آرایه را بدون تغییر برگرداند.
- مقدار قدیمی NULL برابر null و دیکشنری خالی برابر {} برگردد.
- اجرای تاریخی details همان Run را بدهد، نه آخرین Run.
- دسترسی supervisor خارج از دپارتمان و analyst همچنان رد شود.
- فهرست تماس شامل details یا متن کامل نشود.

دستور پیشنهادی از پوشهٔ backend:

```sh
uv run pytest tests/test_reports.py
```

پس از اعمال تغییر و موفقیت بررسی‌ها، یک تماس تکمیل‌شده را از فرانت باز کنید. رابط فعلی فیلد details را در صورت وجود نشان می‌دهد؛ قالب تخصصی فیلدهای آن پس از مشاهدهٔ ساختار واقعی و بدون حذف کلیدها بهبود می‌یابد. خروجی OpenAPI تازه نیز برای همگام‌کردن قرارداد تهیه شود.

این سند پیشنهاد آمادهٔ مشورت است؛ انجام تغییر منوط به تصمیم و اجرای کاربر است.
