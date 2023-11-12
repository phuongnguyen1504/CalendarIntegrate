import moment from "moment";

const detectOverlapSchedules = (schedules, mode, selectedDate) => {
    var lanes = [];
    if (mode == 'day') {
        // Find horizontal lanes (per user)
        const map = new Map();
        schedules.forEach(element => {
            var lane = map.get(element.resourceId);
            if (lane) {
                lane.push(element);
            } else {
                lane = [element];
                map.set(element.resourceId, lane);
                lanes.push(lane);
            }
        });
    }
    else { // week or month
        // Find horizontal lanes (per day)
        const map = new Map();
        schedules.forEach(element => {
            var date = moment(element.date).format("YYYY-MM-DD");
            var lane = map.get(date);
            if (lane) {
                lane.push(element);
            } else {
                lane = [element];
                map.set(date, lane);
                lanes.push(lane);
            }
        })
    }

    lanes.forEach(lane => {
        if (lane.length > 1) {
            // Check if two schedules are overlapped.
            // There are 4 overlap cases
            // S1: |   -----------  | |---------------| |  -----------| |----------   |
            // S2: |----------------| |   ---------   | |----------   | |   ----------|
            for (let i = 0; i < lane.length; i++) {
                var item1 = lane[i];
                var s1 = new Date(item1.start).getTime();
                var e1 = new Date(item1.end).getTime();
                for (let j = 0; j < lane.length; j++) {
                    var item2 = lane[j];
                    if (j != i && item2 != item1.overlapItem && item1 != item2.overlapItem) {
                        var s2 = new Date(item2.start).getTime();
                        var e2 = new Date(item2.end).getTime();
                        var overlapTime = null;
                        if (s1 >= s2 && e1 <= e2) {
                            overlapTime = {
                                start: s1,
                                end: e1
                            }
                        } else if (s1 <= s2 && e1 >= e2) {
                            overlapTime = {
                                start: s2,
                                end: e2
                            }
                        } else if (s1 < e2 && s1 >= s2) {
                            overlapTime = {
                                start: s1,
                                end: e2
                            }
                        } else if (e1 > s2 && e1 <= e2) {
                            overlapTime = {
                                start: s2,
                                end: e1
                            }
                        }

                        if (overlapTime != null) {
                            overlapTime.start = (overlapTime.start - s1)/(e1 - s1);
                            overlapTime.end = (overlapTime.end - s1)/(e1 - s1);
                            if (item1.overlapTime != null) {
                                if (item1.overlapTime.start >= overlapTime.start && item1.overlapTime.end <= overlapTime.end) {
                                    item1.overlapTime = overlapTime;
                                    item1.overlapItem.overlapItem = null;
                                    item1.overlapItem = item2;
                                    item2.overlapItem = item1;
                                }
                            } else {
                                item1.overlapTime = overlapTime;
                                item1.overlapItem = item2;
                                item2.overlapItem = item1;
                            }
                        }
                    }
                }
            }
        }
    });
}

const findTopMostSchedule = (schedules) => {
    if (schedules.length > 0) {
        let index = 0;
        for (let i = 1; i < schedules.length; i++) {
            if (schedules[index].displayOrder < schedules[i].displayOrder) {
                index = i;
            }
        }

        return schedules[index];
    }

    return null;
}

const findBottomMostSchedule = (schedules) => {
    if (schedules.length > 0) {
        let index = 0;
        for (let i = 1; i < schedules.length; i++) {
            if (schedules[index].displayOrder > schedules[i].displayOrder) {
                index = i;
            }
        }

        return schedules[index];
    }

    return null;
}

const sortByDisplayOrder = (schedules, asc) => {
    schedules.sort((a, b) => {
        if (asc) {
            if (a.displayOrder < b.displayOrder)
                return -1;
            else if (a.displayOrder > b.displayOrder)
                return 1;
        } else {
            if (a.displayOrder < b.displayOrder)
                return 1;
            else if (a.displayOrder > b.displayOrder)
                return -1;
        }
        return 0;
    });
}

const detectLane = (schedule, schedules, mode) => {
    // Find horizontal lanes (per user)
    const lane = [];
    var schedDate = moment(schedule.date).format("YYYY-MM-DD");
    if (mode == 'day') {
        schedules.forEach(element => {
            var date = moment(element.date).format("YYYY-MM-DD");
            if (element.userId == schedule.userId && element.isMemo == schedule.isMemo && schedDate == date) {
                lane.push(element);
            }
        });
    } else {
        schedules.forEach(element => {
            var date = moment(element.date).format("YYYY-MM-DD");
            if (schedDate == date) {
                lane.push(element);
            }
        })
    }

    return lane;
}

const bringScheduleToFront = (schedule, schedules, mode) => {
    let newSchedules = [];
    const lane = detectLane(schedule, schedules, mode);
    sortByDisplayOrder(lane, false);

    lane.forEach(elm => {
        newSchedules.push({
            id: elm.id,
            displayOrder: elm.displayOrder
        })
    });
    
    let index = newSchedules.findIndex(elm => elm.id == schedule.id);
    let topMostOrder = newSchedules[0].displayOrder;
    for (let i = 0; i < index; i++) {
        newSchedules[i].displayOrder = newSchedules[i + 1].displayOrder;
    }
    newSchedules[index].displayOrder = topMostOrder;

    return newSchedules;
}

const sendScheduleToBack = (schedule, schedules, mode) => {
    let newSchedules = [];
    const lane = detectLane(schedule, schedules, mode);
    sortByDisplayOrder(lane, false);

    lane.forEach(elm => {
        newSchedules.push({
            id: elm.id,
            displayOrder: elm.displayOrder
        })
    });
    
    let index = newSchedules.findIndex(elm => elm.id == schedule.id);
    let bottomMostOrder = newSchedules[newSchedules.length - 1].displayOrder;
    for (let i = newSchedules.length - 1; i > index; i--) {
        newSchedules[i].displayOrder = newSchedules[i - 1].displayOrder;
    }
    newSchedules[index].displayOrder = bottomMostOrder;

    return newSchedules;
}

const pasteSchedule = (sourceSchedule, dataPaste, targetSchedule) => {
    let date = new Date(dataPaste.date);
    let startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    let endOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    let timeRange = new Date(sourceSchedule.endTime).getTime() - new Date(sourceSchedule.startTime).getTime();
    let newStart = new Date(dataPaste.startTime);
    let newEnd = new Date(newStart.getTime() + timeRange);

    if (newStart.getTime() < startOfDate.getTime()) {
        newStart = startOfDate;
        newEnd.setTime(newStart.getTime() + timeRange);
    } else if (newEnd.getTime() > endOfDate.getTime()) {
        newEnd = endOfDate;
        newStart.setTime(newEnd.getTime() - timeRange);
    }

    targetSchedule.startTime = newStart.toISOString();
    targetSchedule.endTime = newEnd.toISOString();
    targetSchedule.memberId = dataPaste.memberId;
    targetSchedule.ownerId = dataPaste.memberId;
    targetSchedule.isMemo = dataPaste.isMemo;
    targetSchedule.isRecurring = false;
    targetSchedule.ownerIds = [dataPaste.memberId];
    targetSchedule.date = startOfDate;
    targetSchedule.hasAttachment = false;
}

const buildDataPasteByTransitionTime = (data, dataPaste, timeMove ) => {
    const transitionTime = timeMove * 60 * 1000;
    let startTime = new Date(data.startTime);
    let endTime = new Date(data.endTime);
    const eventDuration = endTime - startTime;
    startTime = new Date(dataPaste.startTime);
    endTime = new Date(startTime.getTime() + eventDuration);
    const st = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), 0, 0, 0, 0);
    const et = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), 23, 59, 0, 0);

    if (!data.isAllDay) {
        let newStart = new Date(startTime.getTime() + transitionTime);
        let newEnd = new Date(endTime.getTime() + transitionTime);
        if (newEnd.getTime() <= et.getTime()) {
            dataPaste.startTime = newStart;
            dataPaste.endTime = newEnd;
        }
        else {
            newStart = new Date(startTime.getTime() - transitionTime);
            newEnd = new Date(endTime.getTime() - transitionTime);
            if (newStart.getTime() >= st.getTime()) {
                dataPaste.startTime = newStart;
                dataPaste.endTime = newEnd;
            } else {
                dataPaste.endTime = et;
                dataPaste.startTime = et - eventDuration;
            }
        }
        // if (endTime.getHours() < 23 || (endTime.getHours() === 23 && endTime.getMinutes() < 30)) {
        //     dataPaste.startTime = new Date(startTime.getTime() + transitionTime);
        // } else if (startTime.getHours() > 0 || (startTime.getHours() === 0 && startTime.getMinutes() > 30)) {
        //     dataPaste.startTime = new Date(startTime.getTime() - transitionTime);
        // } else {
        //     // set time to make endTime of event in 23:59 when eventDuration > 23 hours
        //     dataPaste.startTime = new Date(startTime.getTime() - eventDuration + (24 * 60 * 60 * 1000 - 60 * 1000));
        // }
        // dataPaste.endTime = new Date(dataPaste.startTime.getTime() + eventDuration);
    }
    
    return dataPaste
}

module.exports = {
    detectOverlapSchedules: detectOverlapSchedules,
    findTopMostSchedule: findTopMostSchedule,
    findBottomMostSchedule: findBottomMostSchedule,
    sortByDisplayOrder: sortByDisplayOrder,
    sendScheduleToBack: sendScheduleToBack,
    bringScheduleToFront: bringScheduleToFront,
    pasteSchedule: pasteSchedule,
    buildDataPasteByTransitionTime: buildDataPasteByTransitionTime
}