// ---------------------------------------------------------
// Takes in input an object (NOT A LIST WITH NATIONS, DATE ecc... )
// "dataset" and draw it.
function Table(dataset) {
    var extend = false

    console.log(typeof (dataset))
    console.log({ dataset })

    const newTabButton = document.createElement('input')
    newTabButton.setAttribute('id', 'popup')
    newTabButton.setAttribute('type', 'image')
    newTabButton.setAttribute('src', 'Icons/popup.png')
    newTabButton.setAttribute('alt', 'Open in a new tab')
    // newTabButton.innerHTML = "Open in a new tab"
    newTabButton.addEventListener("click", function () {
        // if (!extend) {
        //     extend = true
        //     d3.select('.filter-div').transition().duration(1000).style('height', '40vh')
        //     console.log('40vh')
        // } else {
        //     extend = false
        //     d3.select('.filter-div').transition().duration(1000).style('height', '20vh')
        //     console.log('25vh')
        // }
        $('#paperTable').DataTable().clear().draw();
        $('#paperTable').DataTable().rows.add(dataset); // Add new data
        $('#paperTable').DataTable().columns.adjust().draw(); // Redraw the DataTable
        sessionStorage.setItem("dataset", JSON.stringify(dataset));
        var win = window.open("./table.html#test?dataset");
        win.focus()
        // var win = window.open('./table.html');
        // win.focus();
    })

    if ($.fn.dataTable.isDataTable('#paperTable')) {
        $('#paperTable').DataTable().clear().draw();
        $('#paperTable').DataTable().rows.add(dataset); // Add new data
        $('#paperTable').DataTable().columns.adjust().draw(); // Redraw the DataTable
        document.getElementById('popup').remove()
        document.getElementById('paperTable_filter').appendChild(newTabButton)

        console.log('Distrutto')
    } else {
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
                { data: 'Topic' }
            ],
            pageResize: true,
            scrollResize: true,
            scrollY: '15vh',
            scrollCollapse: true,
            paging: true
        });
        document.getElementById('paperTable_filter').appendChild(newTabButton)
    }
}