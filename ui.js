/* PivotCalc — i18n & UI helpers */
(function (global) {
  'use strict';

  const I18N = {
    ar: {
      tagline: 'حاسبة البيفوت الزراعي',
      idea: 'فكرة البرنامج',
      verse: 'آية',
      about: 'تعريف بالتطبيق',
      theme: 'الوضع الداكن',
      eyebrow: 'CENTER PIVOT',
      mainTitle: 'حساب العجلات ومساحة البيفوت',
      heroDesc: 'أدخل المساحة والماركة وعرض الجرة، ثم عدّل توزيع الجرر واحفظه ليعود مع «ملء تلقائي».',
      offlineReady: 'جاهز للعمل أوفلاين',
      installApp: 'تثبيت التطبيق',
      tabArea: 'حساب العجلات',
      tabPlant: 'معدل الزراعة',
      tabHarvest: 'معدل الحصاد',
      tabNeeds: 'احتياجات الزراعة والحصاد',
      inputsKicker: 'بيانات أساسية',
      pivotInputs: 'بيانات البيفوت',
      pivotArea: 'مساحة البيفوت (فدان)',
      brand: 'ماركة البيفوت',
      spanWidth: 'عرض الجرة (متر)',
      saveDesign: 'حفظ التصميم',
      summaryTable: 'ملخص الحساب',
      radius: 'نصف القطر',
      totalTracks: 'إجمالي الجرر',
      tracksPerWheel: 'جرر/عجلة',
      activeWheels: 'العجلات',
      pivotAreaResult: 'التوتال',
      halfArea: 'مساحة نصف البيفوت',
      towerLength: 'طول البرج',
      editableTracksTitle: 'توزيع العجلات والجرر',
      editable: 'تعديل مباشر',
      editTracksHint: 'امسح أي خلية واكتب عدد الجرر الذي تريده. الحساب والمساحة يتحدثان فورًا.',
      autoFill: 'ملء تلقائي',
      clear: 'مسح الجرر',
      wheelNo: 'العجلة',
      tracksNo: 'عدد الجرر',
      wheelArea: 'المساحة (فدان)',
      tableTotal: 'التوتال',
      areaNote: 'مساحة كل عجلة تُحسب من موضعها الفعلي على نصف القطر وفق معادلة بيرو. العجلة الأخيرة هي المتبقي من الجرر المحسوبة.',
      savedDesignsTitle: 'التصميمات المحفوظة',
      designName: 'اسم التصميم',
      save: 'حفظ',
      newDesign: 'تصميم جديد',
      biroTitle: 'معادلة بيرو المستخدمة',
      formulaNote: 'حيث θ = asin(d / R)، والمساحات المتتابعة = المساحة التراكمية الحالية − السابقة.',
      manualInputs: 'مدخلات يدوية',
      plantRateTitle: 'معدل الزراعة',
      avgJumboWeight: 'متوسط وزن الجامبو (طن)',
      totalJumbos: 'إجمالي عدد الجامبوهات',
      persistentInputs: 'هذه المدخلات لا تُمسح عند إعادة حساب مساحة البيفوت.',
      outputs: 'المخرجات',
      plantResults: 'نتائج الزراعة',
      seedQty: 'إجمالي كمية التقاوي المنزرعة',
      ton: 'طن',
      plantRate: 'معدل الزراعة',
      tonFeddan: 'طن/فدان',
      usesArea: 'يعتمد تلقائيًا على إجمالي مساحة البيفوت من التبويب الأول.',
      harvestBox: 'الحاصد',
      harvestRateTitle: 'معدل الحصاد',
      harvestedJumbos: 'عدد الجامبوهات المحصودة',
      harvestRate: 'معدل الحصاد',
      jumboFeddan: 'جامبو/فدان',
      needsPlant: 'احتياجات الزراعة',
      plantNeedsTitle: 'حساب احتياجات الزراعة',
      avgWeightTon: 'متوسط وزن الجامبو (طن)',
      areaFeddan: 'المساحة (فدان)',
      plantRateTonFeddan: 'معدل الزراعة (طن/فدان)',
      jumbosForArea: 'عدد الجامبوهات للمساحة',
      quantityTon: 'الكمية',
      needsHarvest: 'احتياجات الحصاد',
      harvestNeedsTitle: 'حساب احتياجات الحصاد',
      harvestRateTonInput: 'معدل الحصاد (جامبو/فدان)',
      harvestJumboWeight: 'متوسط وزن الجامبو (طن)',
      harvestTargetMode: 'طريقة تحديد المطلوب',
      targetJumbos: 'عدد الجامبوهات',
      targetTrucks: 'عدد العربيات',
      targetHarvestJumbos: 'الجامبوهات المطلوبة',
      targetHarvestTrucks: 'عدد العربيات المطلوبة',
      truckCapacity: 'حمولة العربية (جامبو)',
      harvestJumbos: 'عدد الجامبوهات',
      harvestTargetTons: 'إجمالي الطن المطلوب',
      requiredHarvestArea: 'مساحة الحصاد المطلوبة',
      feddanUnit: 'فدان',
      trucks: 'عدد السيارات',
      designer: 'تصميم مهندس محمد إبراهيم (فرمينو)',
      equationFooter: 'جميع المعادلات مبنية على معادلة بيرو',
      call: 'اتصال',
      contactNote: 'الروابط الرسمية تحاول فتح التطبيق المثبت، وإلا تفتح نسخة الويب المتاحة للخدمة.',
      customKicker: 'اختيار آخر',
      customTitle: 'تخصيص أطوال الأبراج أو عدد الجرر',
      customName: 'اسم الماركة',
      customMode: 'طريقة الإدخال',
      modeTracks: 'عدد الجرر',
      modeLength: 'طول البرج (متر)',
      customHint: 'العجلة الأخيرة تُحسب تلقائيًا كالمتبقي.',
      saveContinue: 'حفظ ومتابعة',
      cancel: 'إلغاء',
      deleteBrand: 'حذف الماركة',
      installKicker: 'تثبيت PivotCalc',
      installTitle: 'تثبيت كتطبيق',
      installAndroid: 'Chrome: افتح القائمة ⋮ ثم «تثبيت التطبيق». إذا ظهر زر التثبيت هنا فاضغطه.',
      installIOS: 'Safari: مشاركة ↗ ثم «إضافة إلى الشاشة الرئيسية».',
      installWindows: 'Chrome أو Edge: افتح قائمة المتصفح ثم «Install PivotCalc».',
      installNote: 'للتثبيت كتطبيق يجب فتح PivotCalc من رابط HTTPS. فتح ملف HTML مباشرة من الهاتف لا يثبت PWA.',
      verseTitle: 'آية كريمة',
      aboutBody: 'PivotCalc تطبيق لحساب توزيع عجلات البيفوت المركزي ومساحة كل عجلة وفق معادلة بيرو، مع معدلات الزراعة والحصاد واحتياجاتها. يعمل أوفلاين ويمكن تثبيته على الشاشة الرئيسية.',
      ideaBody: 'فكرة البرنامج: تسهيل حساب عدد الجرر لكل عجلة ومساحتها على البيفوت الزراعي بدقة، مع حفظ التصميمات وتخصيص الماركات، وحساب التقاوي والحصاد للمهندسين والمزارعين.',
      otherBrand: 'اختيار آخر / مخصص',
      loadDesign: 'تحميل',
      deleteDesign: 'حذف',
      editBrand: 'تعديل الماركة',
      deleteBrandConfirm: 'حذف هذه الماركة المخصصة؟',
      deleteDesignConfirm: 'حذف هذا التصميم؟',
      saved: 'تم الحفظ',
      noDesigns: 'لا توجد تصميمات محفوظة بعد.',
      m: 'م',
      feddan: 'فدان'
    },
    en: {
      tagline: 'Center Pivot Calculator',
      idea: 'App idea',
      verse: 'Verse',
      about: 'About',
      theme: 'Dark mode',
      eyebrow: 'CENTER PIVOT',
      mainTitle: 'Wheels & Pivot Area Calculator',
      heroDesc: 'Enter area, brand and track width, then edit track distribution and save it for Auto-fill.',
      offlineReady: 'Ready offline',
      installApp: 'Install app',
      tabArea: 'Wheels calc',
      tabPlant: 'Planting rate',
      tabHarvest: 'Harvest rate',
      tabNeeds: 'Plant & harvest needs',
      inputsKicker: 'Basic data',
      pivotInputs: 'Pivot data',
      pivotArea: 'Pivot area (feddan)',
      brand: 'Pivot brand',
      spanWidth: 'Track width (m)',
      saveDesign: 'Save design',
      summaryTable: 'Summary',
      radius: 'Radius',
      totalTracks: 'Total tracks',
      tracksPerWheel: 'Tracks/wheel',
      activeWheels: 'Wheels',
      pivotAreaResult: 'Total',
      halfArea: 'Half pivot area',
      towerLength: 'Tower length',
      editableTracksTitle: 'Wheels & tracks distribution',
      editable: 'Live edit',
      editTracksHint: 'Tap any cell and type track count. Area updates instantly.',
      autoFill: 'Auto-fill',
      clear: 'Clear tracks',
      wheelNo: 'Wheel',
      tracksNo: 'Tracks',
      wheelArea: 'Area (feddan)',
      tableTotal: 'Total',
      areaNote: 'Each wheel area is computed from its position on the radius using Biro equation. Last wheel is the remaining tracks.',
      savedDesignsTitle: 'Saved designs',
      designName: 'Design name',
      save: 'Save',
      newDesign: 'New design',
      biroTitle: 'Biro equation used',
      formulaNote: 'Where θ = asin(d / R), successive areas = current cumulative − previous.',
      manualInputs: 'Manual inputs',
      plantRateTitle: 'Planting rate',
      avgJumboWeight: 'Avg jumbo weight (ton)',
      totalJumbos: 'Total jumbos',
      persistentInputs: 'These inputs are not cleared when recalculating pivot area.',
      outputs: 'Outputs',
      plantResults: 'Planting results',
      seedQty: 'Total seed planted',
      ton: 'ton',
      plantRate: 'Planting rate',
      tonFeddan: 'ton/feddan',
      usesArea: 'Uses total pivot area from the first tab automatically.',
      harvestBox: 'Harvester',
      harvestRateTitle: 'Harvest rate',
      harvestedJumbos: 'Harvested jumbos',
      harvestRate: 'Harvest rate',
      jumboFeddan: 'jumbo/feddan',
      needsPlant: 'Planting needs',
      plantNeedsTitle: 'Planting needs calc',
      avgWeightTon: 'Avg jumbo weight (ton)',
      areaFeddan: 'Area (feddan)',
      plantRateTonFeddan: 'Planting rate (ton/feddan)',
      jumbosForArea: 'Jumbos for area',
      quantityTon: 'Quantity',
      needsHarvest: 'Harvest needs',
      harvestNeedsTitle: 'Harvest needs calc',
      harvestRateTonInput: 'Harvest rate (jumbo/feddan)',
      harvestJumboWeight: 'Avg jumbo weight (ton)',
      harvestTargetMode: 'Target mode',
      targetJumbos: 'Number of jumbos',
      targetTrucks: 'Number of trucks',
      targetHarvestJumbos: 'Required jumbos',
      targetHarvestTrucks: 'Required trucks',
      truckCapacity: 'Truck capacity (jumbo)',
      harvestJumbos: 'Jumbos count',
      harvestTargetTons: 'Total tons required',
      requiredHarvestArea: 'Required harvest area',
      feddanUnit: 'feddan',
      trucks: 'Trucks',
      designer: 'Designed by Eng. Mohamed Ibrahim (Firmino)',
      equationFooter: 'All equations based on Biro formula',
      call: 'Call',
      contactNote: 'Official links try to open the installed app, otherwise the available web version.',
      customKicker: 'Custom',
      customTitle: 'Customize tower lengths or track counts',
      customName: 'Brand name',
      customMode: 'Input mode',
      modeTracks: 'Track counts',
      modeLength: 'Tower length (m)',
      customHint: 'Last wheel is computed automatically as remainder.',
      saveContinue: 'Save & continue',
      cancel: 'Cancel',
      deleteBrand: 'Delete brand',
      installKicker: 'Install PivotCalc',
      installTitle: 'Install as app',
      installAndroid: 'Chrome: menu ⋮ then “Install app”. If install button appears here, tap it.',
      installIOS: 'Safari: Share ↗ then “Add to Home Screen”.',
      installWindows: 'Chrome or Edge: browser menu then “Install PivotCalc”.',
      installNote: 'To install as PWA open PivotCalc via HTTPS. Opening HTML file directly does not install PWA.',
      verseTitle: 'Holy verse',
      aboutBody: 'PivotCalc calculates center-pivot wheel track distribution and area per wheel using the Biro equation, plus planting/harvest rates and needs. Works offline and is installable to the home screen.',
      ideaBody: 'App idea: make it easy to calculate tracks per wheel and area on agricultural center pivots accurately, with saved designs, custom brands, and seed/harvest calculations for engineers and farmers.',
      otherBrand: 'Other / Custom',
      loadDesign: 'Load',
      deleteDesign: 'Delete',
      editBrand: 'Edit brand',
      deleteBrandConfirm: 'Delete this custom brand?',
      deleteDesignConfirm: 'Delete this design?',
      saved: 'Saved',
      noDesigns: 'No saved designs yet.',
      m: 'm',
      feddan: 'feddan'
    }
  };

  let lang = localStorage.getItem('pivotcalc-lang') || 'ar';

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || (I18N.ar[key]) || key;
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.textContent = lang === 'ar' ? 'EN' : 'عر';
  }

  function toggleLang() {
    lang = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('pivotcalc-lang', lang);
    applyI18n();
    return lang;
  }

  function getLang() { return lang; }

  function fmt(n, digits) {
    if (n == null || isNaN(n)) return '—';
    const d = digits != null ? digits : 2;
    return Number(n).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: d
    });
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('open');
      el.setAttribute('aria-hidden', 'false');
    }
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('open');
      el.setAttribute('aria-hidden', 'true');
    }
  }

  global.PivotUI = { I18N, t, applyI18n, toggleLang, getLang, fmt, openModal, closeModal };
})(typeof window !== 'undefined' ? window : globalThis);
