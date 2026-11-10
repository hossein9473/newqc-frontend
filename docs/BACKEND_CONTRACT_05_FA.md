# قرارداد نهایی درخواست ۰۵ — چرخه سؤال‌ها

مبنا: ffa907a؛ تاریخ 2026-11-10. آماده در کپی جداگانه؛ کاربر اعمال/Commit/Push می‌کند. سرور فعلاً تغییر نمی‌کند. هیچ Migration، وابستگی، Worker یا بازپردازش AI لازم نیست.

## مجوز و سیاست مشترک

پیشوند تمام مسیرها `B=/api/v1/departments/{department_id}/question-sets` است. Bearer JWT فعلی؛ admin/manager همه دپارتمان‌ها و supervisor فقط دپارتمان‌های تخصیص‌یافته. Analyst ممنوع. بدون ورود 401، نقش غیرمجاز 403، دپارتمان خارج از دامنه 404. تمام mutationها دپارتمان فعال و draft می‌خواهند؛ نسخه‌های published و archived قابل ویرایش نیستند.

وزن و ترتیب مختص یک مجموعه‌اند، بنابراین Supervisor مجاز می‌تواند برای سؤال مشترک هم وزن و ترتیب همان مجموعه را تغییر دهد. متن و rubric مشترک فقط admin/manager. حذف سؤال مشترک فعال از draft صریحاً 409 می‌دهد؛ انتشار نیز همچنان حضور همه سؤال‌های مشترک فعال را بررسی می‌کند. max_score ثابت 2 است.

## ۱. ساخت draft

`POST B/drafts`، بدون body، پاسخ 201:

```json
{"id": 12, "department_id": 1, "version": 3, "status": "draft"}
```

اگر published وجود دارد، همان رفتار clone آخرین published حفظ می‌شود (وزن‌های آن حفظ؛ آخرین revision مشترک‌های فعال اضافه/جایگزین می‌شود). اگر published وجود ندارد، نسخه اول با مشترک‌های فعال و آخرین revision آن‌ها ساخته می‌شود؛ سؤال اختصاصی خودکار اضافه نمی‌شود. نبود سؤال مشترک اجازه draft خالی می‌دهد، نه انتشار خالی. شماره نسخه max همه وضعیت‌ها + 1 است؛ archived شماره را مصرف می‌کند. وجود هر draft دیگر 409 است. مشترک فعال بدون revision مانع ساخت با پیام مشخص است.

## ۲. وزن

`PATCH B/{question_set_id}/items/{item_id}`

```json
{"weight":"1.250"}
```

پاسخ 200:

```json
{"item_id":30,"weight":"1.250","max_score":2}
```

ورودی **فقط JSON string** با ارقام ASCII، بدون فاصله، علامت مثبت، صفر پیشرو یا نماد علمی. بازه 0.001 تا 9999999.999؛ حداکثر سه رقم اعشار. "1" معتبر و خروجی "1.000" است. "1.0000" حتی با صفر اضافی رد می‌شود. صفر، منفی، NaN، Infinity، عدد JSON، boolean، null، ظرفیت/دقت اضافی و فیلد ناشناخته مثل max_score برابر 422. محاسبه با Decimal؛ پاسخ همیشه رشته با سه رقم اعشار. revision متن تغییر نمی‌کند. مقدار تکراری موفق است ولی Audit تغییر وزن جدید تولید نمی‌کند.

## ۳. ترتیب اتمیک

`PUT B/{question_set_id}/order`

```json
{"item_ids":[32,30,31]}
```

پاسخ 200:

```json
{"id":12,"items":[{"item_id":32,"position":1},{"item_id":30,"position":2},{"item_id":31,"position":3}]}
```

تمام item_idهای فعلی همان draft دقیقاً یک‌بار ارسال شوند، نه question_id یا revision_id. تکراری/ناقص/آیتم خارجی 409؛ نوع نامعتبر، boolean و شناسه غیرمثبت 422. [] فقط برای draft خالی معتبر است. ترتیب نهایی 1..N پیوسته؛ جابه‌جایی به کمک موقعیت‌های موقت در یک transaction انجام می‌شود و در خطا هیچ تغییر جزئی نمی‌ماند. درخواست بدون تغییر Audit جدید ندارد.

## ۴. انتخابگر سؤال

`GET B/question-options?q=...&exclude_draft_id=12&limit=50&offset=0`

پاسخ 200:

```json
{"items":[{"question_id":8,"code":"greeting","title":"عنوان سؤال","rubric":"معیار ارزیابی","revision_id":19,"revision":2,"is_global":true}],"total":1,"limit":50,"offset":0}
```

نام نمایشی همان title متن آخرین revision است؛ field مستقلی به نام name وجود ندارد. فقط سؤال فعال مشترک یا متعلق به همین دپارتمان و دارای revision برمی‌گردد. ترتیب question_id صعودی؛ latest با بیشترین شماره revision. q اختیاری، 1..200 کاراکتر، جست‌وجوی contains در code/title/rubric؛ % و _ به صورت کاراکتر واقعی جست‌وجو می‌شوند، نه wildcard. حساسیت حروف مطابق collation دیتابیس است. limit پیش‌فرض 50 و 1..100؛ offset پیش‌فرض 0 و نامنفی. total بعد از همه فیلترهاست.

exclude_draft_id اختیاری: همه logical questionهای موجود در آن draft، مستقل از revision انتخاب‌شده، حذف می‌شوند. draft باید مربوط به همان دپارتمان باشد؛ ناشناخته/خارجی 404 و غیر draft برابر 409. سؤال بدون revision قابل انتخاب نیست. انتخابگر اطلاعات سایر دپارتمان‌ها را نشان نمی‌دهد و mutation یا Audit ندارد. برای افزودن انتخاب، endpoint موجود `POST B/{set_id}/existing-questions` با `{"question_id":8}` استفاده شود.

## ۵. کنارگذاشتن draft

`POST B/{question_set_id}/discard`، بدون body. پاسخ 200:

```json
{"id":12,"department_id":1,"version":3,"status":"archived"}
```

فرانت پیش از ارسال، جزئیات draft را نمایش دهد و تأیید کاربر بگیرد. همه itemها، سؤال‌ها و revisionها باقی می‌مانند و از GET جزئیات نسخه قابل مرورند. published دست‌نخورده است. تکرار discard برابر 409، نه حذف یا موفقیت مجدد. پس از آن ساخت draft جدید ممکن است. اگر published هست، draft بعدی از published ساخته می‌شود، نه از draft کنارگذاشته‌شده. مسیر بازگرداندن archived به draft اضافه نشده است.

## مسیرهای قبلی و تاریخچه

GET B و GET B/{set_id}، افزودن سؤال جدید/موجود، ویرایش متن، حذف و انتشار حفظ شده‌اند. حذف آخرین آیتم مطابق قاعده قبلی ممنوع است؛ برای شروع دوباره از discard استفاده کنید. archived بودن فقط وضعیت مجموعه است؛ سؤال ایجادشده در draft کنارگذاشته‌شده غیرفعال یا حذف نمی‌شود و ممکن است در انتخابگر سؤال موجود قابل استفاده باشد. بازنگری‌های کنارگذاشته‌شده نیز باقی می‌مانند؛ انتخابگر آخرین revision را می‌دهد، ولی clone سؤال اختصاصی از published همان revision منتشرشده را نگه می‌دارد.

هیچ EvaluationRun/Answer قبلی یا published item بازنویسی نمی‌شود. زمان published_at قرارداد UTC موجود را حفظ می‌کند؛ این بسته قالب زمان را تغییر نمی‌دهد.

## خطاهای مستند برای UI

ساختار خطاهای domain مانند قبل `{"detail":"message"}` است، نه code جدید. Validation ورودی 422 با آرایه detail استاندارد FastAPI است. متن ثابت/پیشوندهای زیر قابل استفاده‌اند:

| HTTP | detail یا پیشوند | اقدام UI |
|---|---|---|
|409|Publish or discard the existing draft first|draft موجود را باز کن|
|409|Active department not found|دپارتمان غیرفعال است؛ مدیریت وضعیت لازم است|
|409|Only draft question sets can be modified|جزئیات را refresh کن؛ ویرایش غیرفعال|
|409|Only draft question sets can be published|انتشار برای وضعیت فعلی مجاز نیست|
|409|Only the newest question set version can be published|نسخه‌ها را refresh کن|
|409|Cannot publish an empty question set|ابتدا سؤال اضافه کن|
|409|Draft is missing active global questions:|مشترک‌های جاافتاده را از انتخابگر اضافه کن|
|409|Global question ... has no revision|مدیر باید revision سؤال مشترک را تکمیل کند|
|409|Active global questions cannot be removed from a draft|حذف سؤال مشترک فعال ممنوع|
|409|Order must contain every draft item exactly once|draft را دوباره بگیر و کل ترتیب را ارسال کن|
|409|Question position capacity exceeded|داده موقعیت نیازمند بررسی است|
|404|Question set not found / Question set item not found in this draft|آیتم یا نسخه معتبر را دوباره انتخاب کن|
|404|Active question not found|سؤال فعال موجود را انتخاب کن|
|409|Question has no revision / Question is already in this draft|انتخابگر را refresh کن|
|409|Question set version conflict / Question set publication conflict / Question data conflict|پس از refresh تعارض را بررسی کن|
|409|Question transaction conflict; retry|تعارض lock؛ refresh و تلاش محدود مجدد|
|503|Question storage temporarily unavailable|خطای موقت ذخیره‌سازی؛ تلاش مجدد محدود|

پیام‌های اعتبارسنجی قبلی انتشار مانند Inactive question، Incomplete question revision و Invalid scoring همچنان برقرارند. جزئیات SQL در پاسخ نمی‌آیند. UI نباید هر 409 را یک خطای عمومی نامفهوم نمایش دهد.

## هم‌زمانی و Audit

ساخت، ویرایش، انتشار و discard بر قفل دپارتمان سپس مجموعه تکیه دارند؛ وضعیت بعد از قفل دوباره خوانده می‌شود. سفارش کامل پس از قفل با اعضای جاری تطبیق داده می‌شود. این API optimistic revision/ETag ندارد: برای دو درخواست معتبر متوالی وزن/ترتیب، آخرین درخواست موفق ملاک است. خطای transaction rollback می‌شود؛ جابه‌جایی نیمه‌کاره ذخیره نمی‌شود.

Auditهای جدید: question_set.draft_created، question_set.item_weight_changed، question_set.items_reordered، question_set.draft_discarded. مسیرهای API افزودن/ویرایش/حذف و انتشار نیز Audit معنی‌دار با actor دارند؛ متن کامل rubric در Audit ذخیره نمی‌شود. سازگاری Audit ابزار bootstrap قبلی حفظ شده است.

## بررسی

۹۸ تست مرتبط و ۸۷۶ تست کل، Ruff و قالب‌بندی موفق. تست SQLite با FK فعال، خطای اجباری در مرحله دوم reorder، stale state، مجوزها، وزن مرزی، published و ارزیابی قبلی اجرا شد. تست هم‌زمانی واقعی MySQL، تست زنده فرانت و استقرار سرور انجام نشده؛ SQLite قفل ردیفی MySQL را شبیه‌سازی نمی‌کند. نتیجه کامل در VALIDATION.md است. پس از اعمال کاربر، API لوکال restart شود.
