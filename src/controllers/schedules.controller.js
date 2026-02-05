import axios from 'axios';
import { validationError } from '../utils/errors.js';
import config from '../config/config.js';
import extractSchedule from '../extractor/extractSchedule.js';

async function schedulesController(c) {
    const today = new Date();
    const dateParam = c.req.query('date');
    const tzOffsetParam = c.req.query('tzOffset');

    // default timezone offset (IST -360 minutes) but allow override via tzOffset query param
    let timezoneOffset = -360; // minutes
    if (tzOffsetParam != null && String(tzOffsetParam).trim() !== '') {
        const parsed = Number(tzOffsetParam);
        if (!Number.isInteger(parsed)) {
            throw new validationError("Invalid 'tzOffset'. Expected integer minutes offset (e.g., -360)");
        }
        timezoneOffset = parsed;
    }

    let startDate = today;
    if (dateParam) {
        const [year, month, day] = dateParam.split('-').map(Number);
        startDate = new Date(year, month - 1, day);
        if (isNaN(startDate.getTime())) {
            throw new validationError('Invalid date format. Use YYYY-MM-DD');
        }
    }

    const dates = [];

    // If both tzOffset and date are provided, return only that single date instead of 7 days
    if (dateParam && tzOffsetParam != null && String(tzOffsetParam).trim() !== '') {
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    } else {
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.push(`${year}-${month}-${day}`);
        }
    }

    try {
        const promises = dates.map(async (date) => {
            const ajaxUrl = `/ajax/schedule/list?tzOffset=${timezoneOffset}&date=${date}`;
            try {
                const { data } = await axios.get(config.baseurl + ajaxUrl, {
                    headers: {
                        ...config.headers,
                        Referer: config.baseurl + '/home',
                    },
                    timeout: 10000,
                });
                return {
                    date,
                    shows: extractSchedule(data.html)
                };
            } catch (err) {
                console.error(`Failed to fetch schedule for ${date}: ${err.message}`);
                return {
                    date,
                    shows: [],
                    error: 'Failed to fetch'
                };
            }
        });

        const results = await Promise.all(promises);

        // Format response to map dates to shows
        const response = {};
        results.forEach(result => {
            response[result.date] = result.shows;
        });

        return {
            success: true,
            data: response
        };

    } catch (error) {
        console.error(error.message);
        throw new validationError('Failed to fetch schedules');
    }
}

export default schedulesController;
