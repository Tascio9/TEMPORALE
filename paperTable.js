// "use strict";

// fetch('./myFirstDatasetCleaned.json')
//     .then(function (resp) {
//         return resp.json();
//     })
//     .then(function (data) {
//         // console.log(data);
//         $('#paperTable').DataTable({
//             data: data,
//             columns: [
//                 { data: 'Index' },
//                 { data: 'Cord_UID' },
//                 { data: 'Paper_ID' },
//                 { data: 'Nation' },
//                 { data: 'Title' },
//                 { data: 'Publish_time' }
//             ],
//             scrollResize: true,
//             scrollY: 100,
//             scrollCollapse: true,
//             paging: true
//         });
//     });

function Table(dataset) {
    if ($.fn.dataTable.isDataTable('#paperTable')) {
        $('#paperTable').DataTable().clear().destroy();
    }
    $('#paperTable').DataTable({
        data: dataset,
        columns: [
            { data: 'Cord_UID' },
            {
                data: 'Title',
                render: function (data, type, row) {
                    return `<a href="https://www.doi.org/${row.DOI}" target="_blank">${data}</a>`
                }
            },
            { data: 'First_author' },
            { data: 'Nation' },
            { data: 'Publish_time' },
            { data: 'Journal' }
        ],
        scrollResize: true,
        scrollY: 100,
        scrollCollapse: true,
        paging: true
    });
}