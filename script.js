document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('incident-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const incidentTypes = Array.from(form.querySelectorAll('input[name="incident-type"]:checked')).map(input => input.value);
        if (incidentTypes.length === 0) {
            alert('Please select at least one incident type.');
            return;
        }

        const data = Object.fromEntries(formData);
        data['incident-type'] = incidentTypes.join(', ');

        // Replace input values with their text for PDF rendering
        const inputs = form.querySelectorAll('input[type="text"], input[type="date"], textarea');
        inputs.forEach(input => {
            const p = document.createElement('p');
            p.textContent = input.value || 'N/A';
            p.style.margin = '0';
            p.style.padding = '8px';
            p.style.border = '1px solid #ccc';
            p.style.borderRadius = '4px';
            p.style.backgroundColor = '#f0f0f0';
            input.parentNode.replaceChild(p, input);
        });

        const checkboxes = form.querySelectorAll('input[name="incident-type"]');
        const checkboxContainer = form.querySelector('.checkbox-group');
        const p = document.createElement('p');
        p.textContent = incidentTypes.join(', ') || 'None';
        p.style.margin = '0';
        checkboxContainer.innerHTML = '';
        checkboxContainer.appendChild(p);

        // Generate PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const element = document.getElementById('form-container');

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = pdfHeight;
            let position = 0;

            doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= doc.internal.pageSize.getHeight();

            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= doc.internal.pageSize.getHeight();
            }

            doc.save('incident-report.pdf');
            alert('PDF downloaded successfully!');
            form.reset();
            window.location.reload(); // Reload to restore form
        } catch (error) {
            alert('Error generating PDF. Please try again.');
            console.error(error);
            window.location.reload();
        }
    });
});