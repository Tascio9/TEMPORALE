// ---------------------------------------------------------
// Takes in input an object (NOT A LIST WITH NATIONS, DATE ecc... )
// "dataset" and draw it.
function Table(dataset) {
    if ($.fn.dataTable.isDataTable('#paperTable')) {
        $('#paperTable').DataTable().clear().destroy();
    }
    $('#paperTable').DataTable({
        dom: 'Zlfrtip',             // Needed to use colResize. See it on index.html
        data: dataset,
        columns: [
            { data: 'Cord_UID' },
            {
                data: 'Title',
                render: function (data, type, row) {
                    return `<a href="https://www.doi.org/${row.DOI}" target="_blank">${data}</a>`
                }
            },
            {
                data: 'First_author',
                render: function (data, type, row) {
                    return `${data} et al .`
                }
            },
            { data: 'Nation' },
            { data: 'Publish_time' },
            { data: 'Journal' },
            { data: 'Classification' }
        ],
        pageResize: true,
        scrollResize: true,
        scrollY: '15vh',
        scrollCollapse: true,
        paging: true
    });

}