import moment from "moment";
import { detectOverlapSchedules } from "./scheduleUtil";
import { startOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const convertHexToRGB = (hex) => {
    const hexToRgbArray = (hex) =>
        hex
            .replace(
                /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
                (m, r, g, b) => "#" + r + r + g + g + b + b
            )
            .substring(1)
            .match(/.{2}/g)
            .map((x) => parseInt(x, 16));

    return `rgb(${hexToRgbArray(hex)[0]}, ${hexToRgbArray(hex)[1]}, ${hexToRgbArray(hex)[2]
        })`;
};

const setTextColorIsDark = (colorCode) => {
    let isDark = 0;
    if (colorCode?.length <= 7) {
        colorCode = convertHexToRGB(colorCode);
    }
    for (let i = 4; i <= 14; i += 5) {
        if (Number(colorCode?.substr(i, 3)) > 128) {
            isDark++;
        }
    }
    return isDark >= 2 ? true : false;
};

const toResourceId = (schedule) => {
    return schedule.isMemo ? schedule.userId + "_memo" : schedule.userId;
}

const buildEventData = (type, schedules, members, memberSelected, dateSelected, isPrint, weekDuration = 7) => {
    let userId = memberSelected ? memberSelected.value : "All";
    let arrCopy = [...schedules];
    let newData = [];
    if (type === "day") {
        let dateStr = moment(dateSelected).format("YYYY-MM-DD");
        arrCopy.forEach((item) => {
            if (dateStr == moment(item.date).format("YYYY-MM-DD")) {
                let member = members.find(m => m.id == item.userId);
                if (member) {
                    let isCreate = (item.isMemo === false && member.permissions.createSchedule) || (item.isMemo === true && member.permissions.createMemo);
                    let isEdit = (item.isMemo === false && (member.permissions.editSchedule)) || (item.isMemo === true && member.permissions.editMemo);
                    let isDelete = (item.isMemo === false && member.permissions.deleteSchedule) || (item.isMemo === true && member.permissions.deleteMemo);
                    let isFullView = (item.isMemo === false && member.permissions.viewSchedule === 0) || (item.isMemo === true && member.permissions.viewMemo);
                    newData.push({
                        title: item.name,
                        start: item.startTime,
                        end: item.endTime,
                        resourceId: toResourceId(item),
                        id: item.id,
                        icons: item.icons,
                        hasAttachment: item.hasAttachment,
                        isMemo: item.isMemo,
                        selectable: isCreate,
                        createdBy: item.createdBy,
                        createdAt: item.createdAt,
                        displayOrder: item.displayOrder,
                        editable: isPrint ? false : true, // determines whether the user can drag event
                        resourceEditable: isPrint ? false : true, // determines whether the user can drag event between resources
                        allDay: item.isAllDay,
                        durationEditable: item.isAllDay || isPrint ? false : true,
                        isFullView: isFullView,
                        isEdit: isEdit,
                        isDelete: isDelete,
                        isRecurring: item.recurringId !== null && item.recurringId !== undefined,
                        color: item.colorCode,
                        textColor: setTextColorIsDark(item?.colorCode)
                            ? `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_BLACK}`
                            : `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_WHITE}`,
                        // interactive: item?.editable, //need to user interactive due to fullCalendar keyword requirement.
                        overlap: true,
                    });
                }
            }
        });
        // console.log("index::newData: ", newData);
        // Set top-most schedules
        detectOverlapSchedules(newData, 'day');
    } else if (type === "week") {
        const startDate = moment(startOfWeek(dateSelected, { weekStartsOn: 0 })).format("YYYY-MM-DD");
        const endDate = moment(startOfWeek(dateSelected, { weekStartsOn: 0 })).add(weekDuration, "days").format("YYYY-MM-DD");
        arrCopy.forEach((item) => {
            const dateStr = moment(item.date).format("YYYY-MM-DD");
            if (dateStr >= startDate && dateStr <= endDate) {
                if (item.userId == userId || userId == "All") {
                    let member = members.find(m => m.id == item.userId);
                    if (member) {
                        let isCreate = userId === "All" || (item.isMemo === false && member.permissions.createSchedule) || (item.isMemo === true && member.permissions.createMemo);
                        let isEdit = (item.isMemo === false && member.permissions.editSchedule) || (item.isMemo === true && member.permissions.editMemo);
                        let isDelete = (item.isMemo === false && member.permissions.deleteSchedule) || (item.isMemo === true && member.permissions.deleteMemo);
                        let isFullView = member.permissions.viewSchedule === 0 || member.permissions.viewMemo;
                        newData.push({
                            // title: FindExistance(permissionCDs, "schedule_read")
                            //   ? item.name
                            //   : item.userId === userId
                            //   ? item.name
                            //   : " ",
                            // shortTitle: item.shortName,
                            start: item.startTime,
                            end: item.endTime,
                            // // resourceId: new Date(item.startTime).getDate(),
                            // id: item.id,
                            // color: item.colorCode,
                            // file: item.file,
                            // createdBy: item.createdBy,
                            title: item.name,
                            // shortTitle: item.shortName,
                            id: item.id,
                            icons: item.icons,
                            hasAttachment: item.hasAttachment,
                            isMemo: item.isMemo,
                            selectable: isCreate,
                            createdBy: item.createdBy,
                            date: moment(item.date).format("YYYY-MM-DD"),
                            displayOrder: item.displayOrder,
                            editable: isPrint ? false : true, // true to show pointer cursor
                            resourceEditable: isPrint ? false : true,
                            userId: item.userId,
                            allDay: item.isAllDay,
                            durationEditable: item.isAllDay || isPrint ? false : true,
                            isEdit: isEdit,
                            isFullView: isFullView,
                            isDelete: isDelete,
                            isRecurring: item.recurringId !== null && item.recurringId !== undefined,
                            color: item.colorCode,
                            textColor: setTextColorIsDark(item?.colorCode)
                                ? `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_BLACK}`
                                : `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_WHITE}`,
                            overlap: true,
                        });
                    }
                }
            }
        });
        detectOverlapSchedules(newData, 'week');
    } else if (type === "month") {
        const startDate = moment(startOfMonth(dateSelected)).format("YYYY-MM-DD");
        const endDate = moment(endOfMonth(dateSelected)).format("YYYY-MM-DD");
        arrCopy.forEach((item) => {
            const dateStr = moment(item.date).format("YYYY-MM-DD");
            if ((item.userId == userId || userId == "All") && dateStr >= startDate && dateStr <= endDate) {
                let member = members.find(m => m.id == item.userId);
                if (member) {
                    let isCreate = userId === "All" || (item.isMemo === false && member.permissions.createSchedule) || (item.isMemo === true && member.permissions.createMemo);
                    let isEdit = ((item.isMemo === false) && member.permissions.editSchedule) || (item.isMemo === true) && (member.permissions.editMemo);
                    let isDelete = ((item.isMemo === false) && member.permissions.deleteSchedule) || ((item.isMemo === true) && member.permissions.deleteMemo);
                    let isFullView = member.permissions.viewSchedule === 0 || member.permissions.viewMemo;
                    newData.push({
                        start: item.startTime,
                        end: item.endTime,
                        // resourceId: new Date(item.startTime).getDate(),
                        // id: item.id,
                        // color: item.colorCode,
                        // file: item.file,
                        // createdBy: item.createdBy,
                        title: item.name,
                        shortTitle: item.shortName,
                        id: item.id,
                        icons: item.icons,
                        hasAttachment: item.hasAttachment,
                        isMemo: item.isMemo,
                        selectable: isCreate,
                        createdBy: item.createdBy,
                        displayOrder: item.displayOrder,
                        date: moment(item.date).format("YYYY-MM-DD"),
                        editable: isPrint ? false : true, // to show pointer cursor
                        resourceEditable: isPrint ? false : true,
                        userId: item.userId,
                        allDay: item.isAllDay,
                        durationEditable: item.isAllDay || isPrint ? false : true,
                        isEdit: isEdit,
                        isFullView: isFullView,
                        isDelete: isDelete,
                        isRecurring: item.recurringId !== null && item.recurringId !== undefined,
                        color: item.colorCode,
                        textColor: setTextColorIsDark(item?.colorCode)
                            ? `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_BLACK}`
                            : `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_WHITE}`,
                        overlap: true,
                    });
                }
            }
        });

        detectOverlapSchedules(newData, 'month');
    } else if (type === "month-calendar") {
        arrCopy.forEach((item) => {
            if (item == undefined) {
                return;
            }

            if (item.userId == userId || userId == "All") {
                let member = members.find(m => m.id == item.userId);
                if (member) {
                    let isCreate = userId === "All" || (item.isMemo === false && member.permissions.createSchedule) || (item.isMemo === true && member.permissions.createMemo);
                    let isEdit = ((item.isMemo === false) && member.permissions.editSchedule) || (item.isMemo === true) && (member.permissions.editMemo);
                    let isDelete = ((item.isMemo === false) && member.permissions.deleteSchedule) || ((item.isMemo === true) && member.permissions.deleteMemo);
                    let isFullView = member.permissions.viewSchedule === 0 || member.permissions.viewMemo;
                    newData.push({
                        start: item.startTime,
                        end: item.endTime,
                        // resourceId: new Date(item.startTime).getDate(),
                        // id: item.id,
                        // color: item.colorCode,
                        // file: item.file,
                        // createdBy: item.createdBy,
                        title: item.name,
                        // Set allDay=true if want to drag timeline to over than 1 oneday
                        // allDay:true,
                        display: 'block',
                        id: item.id,
                        icons: item.icons,
                        hasAttachment: item.hasAttachment,
                        isMemo: item.isMemo,
                        selectable: isCreate,
                        createdBy: item.createdBy,
                        editable: isPrint ? false : true, // true to show pointer cursor
                        resourceEditable: isPrint ? false : true,
                        userId: item.userId,
                        allDay: item.isAllDay,
                        isEdit: isEdit,
                        isFullView: isFullView,
                        isDelete: isDelete,
                        isRecurring: item.recurringId !== null && item.recurringId !== undefined,
                        color: item.colorCode,
                        textColor: setTextColorIsDark(item?.colorCode)
                            ? `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_BLACK}`
                            : `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_WHITE}`,
                        overlap: true,
                    });
                }
            }
        });
    } else if (type === "week-calendar") {
        const schedulesMap = new Map();
        const startDate = moment(startOfWeek(dateSelected, { weekStartsOn: 0 })).format("YYYY-MM-DD");
        const endDate = moment(startOfWeek(dateSelected, { weekStartsOn: 0 })).add(weekDuration - 1, "days").format("YYYY-MM-DD");
        arrCopy.forEach((item) => {
            const dateStr = moment(item.date).format("YYYY-MM-DD");
            if (dateStr >= startDate && dateStr <= endDate) {
                let member = members.find(m => m.id == item.userId);
                if (member) {
                    let isCreate = (item.isMemo === false && member.permissions.createSchedule) || (item.isMemo === true && member.permissions.createMemo);
                    let isEdit = (item.isMemo === false && (member.permissions.editSchedule)) || (item.isMemo === true && member.permissions.editMemo);
                    let isDelete = (item.isMemo === false && member.permissions.deleteSchedule) || (item.isMemo === true && member.permissions.deleteMemo);
                    let isFullView = (item.isMemo === false && member.permissions.viewSchedule === 0) || (item.isMemo === true && member.permissions.viewMemo);

                    const schedule = {
                        title: item.name,
                        start: new Date(item.startTime).setHours(0, 0, 0, 0), // fake start time, end time to expand schedule width to 100% cell width
                        actualStart: item.startTime,
                        end: new Date(item.endTime).setHours(23, 59, 59),
                        actualEnd: item.endTime,
                        resourceId: toResourceId(item),
                        id: item.id,
                        icons: item.icons,
                        hasAttachment: item.hasAttachment,
                        isMemo: item.isMemo,
                        selectable: isCreate,
                        createdBy: item.createdBy,
                        createdAt: item.createdAt,
                        displayOrder: item.displayOrder,
                        editable: isPrint ? false : true, // determines whether the user can drag event
                        resourceEditable: isPrint ? false : true, // determines whether the user can drag event between resources
                        allDay: item.isAllDay,
                        durationEditable: false,
                        isFullView: isFullView,
                        isEdit: isEdit,
                        isDelete: isDelete,
                        isRecurring: item.recurringId !== null && item.recurringId !== undefined,
                        color: item.colorCode,
                        textColor: setTextColorIsDark(item?.colorCode)
                            ? `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_BLACK}`
                            : `#${process.env.NEXT_PUBLIC_TEXT_SCHEDULE_COLOR_WHITE}`,
                        overlap: true,
                    };

                    if (!schedulesMap.has(member.id))
                        schedulesMap.set(member.id, new Map());

                    let userSchedules = schedulesMap.get(member.id);
                    if (!userSchedules.has(dateStr)) {
                        userSchedules.set(dateStr, [schedule]);
                    } else {
                        userSchedules.get(dateStr).push(schedule);
                    }
                    schedulesMap.set(member.id, userSchedules);
                }
            }
        });

        return schedulesMap;
    }

    return newData;
}
const formatNumer = (number) => {
    let num = Number(number);
    if (num > 9) {
        return num;
    }

    let newNumer = "0" + String(num);
    return newNumer;
};

module.exports = {
    buildEventData: buildEventData,
    toResourceId: toResourceId,
}