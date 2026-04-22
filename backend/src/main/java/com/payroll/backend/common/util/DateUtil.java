package com.payroll.backend.common.util;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

public class DateUtil {
    private static final DateTimeFormatter PERIOD_FMT =
        DateTimeFormatter.ofPattern("yyyy-MM");

    public static String formatPeriod(YearMonth ym) {
        return ym.format(PERIOD_FMT);
    }

    public static YearMonth parsePeriod(String period) {
        return YearMonth.parse(period, PERIOD_FMT);
    }

    public static String getCurrentFiscalYear() {
        int year = YearMonth.now().getYear();
        int month = YearMonth.now().getMonthValue();
        return month >= 4
            ? year + "-" + (year + 1)
            : (year - 1) + "-" + year;
    }

    private DateUtil() {}
}